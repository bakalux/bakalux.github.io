import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Gift,
  Heart,
  LockKeyhole,
  PartyPopper,
  RotateCcw,
  RussianRuble,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  WandSparkles,
} from 'lucide-react';

import './App.css';

type Stage =
  | 'openingFireworks'
  | 'intro'
  | 'quiz'
  | 'hostSpeech'
  | 'wheel'
  | 'sectorPrize'
  | 'offer'
  | 'moneyLoading'
  | 'prizeOpening'
  | 'final';

type QuizQuestion = {
  question: string;
  options: string[];
  punchline: string;
  correctOptionIndexes?: number[];
  wrongPunchline?: string;
  optionImages?: Array<string | null>;
};

type AudioContextConstructor = new () => AudioContext;

type AudioKit = {
  context: AudioContext;
  effectsGain: GainNode;
  masterGain: GainNode;
  musicGain: GainNode;
  musicTimer?: number;
};

const wifeName = 'Марина';

const photoAssetModules = import.meta.glob('./assets/asset*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const answerAssetModules = import.meta.glob('./assets/answers/**/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const collagePhotos = Array.from({ length: 5 }, (_, index) => {
  const assetName = `asset${index + 1}.jpg`;
  const matchedPath = Object.keys(photoAssetModules).find((path) => path.endsWith(assetName));

  return matchedPath ? photoAssetModules[matchedPath] : null;
});

function answerImage(fileName: string) {
  const matchedPath = Object.keys(answerAssetModules).find((path) => path.endsWith(fileName));

  return matchedPath ? answerAssetModules[matchedPath] : null;
}

const quizQuestions: QuizQuestion[] = [
  {
    question: 'Что обычно происходит, когда Марина говорит «я на пять минут»?',
    options: ['Вселенная расширяется', 'Часы сами добавляют запас времени', 'Все успевают соскучиться'],
    punchline: 'Верно. Время просто уважает ее стиль.',
  },
  {
    question: 'Главный суперскилл Марины?',
    options: ['Красиво жить', 'Найти лучший вариант', 'Сделать обычный день теплее'],
    punchline: 'Абсолютно. Это встроенная магия, патчить не требуется.',
  },
  {
    question: 'Какой уровень красоты у Марины сегодня включен?',
    options: ['Праздничный максимум', '27 из 10', 'Неприлично красивый'],
    punchline: 'Ответ засчитан. Жюри просит не спорить с очевидным.',
  },
  {
    question: 'Что делать мужу, если Марина хочет подарок?',
    options: ['Согласиться', 'Согласиться быстрее', 'Уточнить цвет и сразу согласиться'],
    punchline: 'Именно. Это был вопрос на внимательность.',
  },
  {
    question: 'Кто сегодня главная звезда вечера?',
    options: ['Марина', 'Самая любимая жена', 'Человек, ради которого это всё сделано'],
    punchline: 'Правильно. Все варианты ведут к одному блестящему ответу.',
  },
  {
    question: 'Какой фильм можно включить, чтобы вечер сразу стал уютнее?',
    options: ['Властелин колец', 'Гарри Поттер', 'Сумерки', 'Шрек'],
    optionImages: [
      answerImage('movie-lotr.jpg'),
      answerImage('movie-harry-potter.jpg'),
      answerImage('movie-twilight.jpg'),
      answerImage('movie-shrek.jpg'),
    ],
    correctOptionIndexes: [1],
    punchline: 'Конечно. Хогвартс одобряет праздничную программу.',
    wrongPunchline: 'Неплохой вариант, но магическая палочка указывает на Гарри Поттера.',
  },
  {
    question: 'Какой суп получает личную звезду Мишлен от Марины?',
    options: ['Борщ', 'Том ям', 'Фо бо', 'Рамен'],
    optionImages: [
      answerImage('soup-borscht.jpg'),
      answerImage('soup-tom-yum.jpg'),
      answerImage('soup-pho-bo.jpg'),
      answerImage('soup-ramen.jpg'),
    ],
    correctOptionIndexes: [2],
    punchline: 'Да. Фо бо уверенно забирает главный бульонный приз.',
    wrongPunchline: 'Звучит вкусно, но праздничная ложка тянется к фо бо.',
  },
  {
    question: 'Какая поездка была лучшей?',
    options: ['Вьетнам', 'Тайланд', 'Бали'],
    optionImages: [answerImage('trip-vietnam.jpg'), answerImage('trip-thailand.jpg'), answerImage('trip-bali.jpg')],
    correctOptionIndexes: [2],
    punchline: 'Бали засчитан. Воспоминания включили режим “хочу обратно”.',
    wrongPunchline: 'Было тепло, но лучший кадр всё-таки с Бали.',
  },
  {
    question: 'Любимый ресторан Марины?',
    options: ['Ce la vi', 'Italy', 'Roots'],
    optionImages: [answerImage('restaurant-ce-la-vi.jpg'), answerImage('restaurant-italy.jpg'), answerImage('restaurant-roots.jpg')],
    correctOptionIndexes: [0, 1, 2],
    punchline: 'Да. Тут ведущий принимает все ответы, потому что вкус у Марины широкий.',
  },
  {
    question: 'Любимая кофейня?',
    options: ['Etlon', 'Все дома', 'Цех85'],
    optionImages: [answerImage('coffee-etlon.jpg'), answerImage('coffee-vse-doma.jpg'), answerImage('coffee-tsekh85.jpg')],
    correctOptionIndexes: [0, 1],
    punchline: 'Точно. Кофейная карта Марины это подтверждает.',
    wrongPunchline: 'Цех85 может быть запасным планом, но любимые здесь Etlon и Все дома.',
  },
];

const moneySteps = [10_000, 20_000, 50_000, 100_000, 200_000, 500_000, 1_000_000];

const celebrationLevels: Record<Stage, number> = {
  openingFireworks: 8,
  intro: 18,
  quiz: 38,
  hostSpeech: 52,
  wheel: 64,
  sectorPrize: 74,
  offer: 84,
  moneyLoading: 90,
  prizeOpening: 96,
  final: 100,
};

const hostSpeechLines = [
  'Дорогая Марина, внимание на студию.',
  'Викторина пройдена без единой реальной возможности ошибиться.',
  'А значит, настало время главного праздничного торга.',
  'Ассистенты готовы, барабан заряжен, сектор подозрительно блестит.',
];

const sectors = [
  'Приз',
  'Объятия',
  'Сюрприз',
  'Торт',
  'Комплимент',
  'Сияние',
  'Поцелуй',
  'Еще раз',
];

const sectorColors = [
  '#ffeb6a',
  '#ff6b9f',
  '#57d8ff',
  '#9c6bff',
  '#70e07b',
  '#ff9f43',
  '#ff5757',
  '#53e0c2',
];

function formatMoney(value: number) {
  if (value >= 1_000_000) {
    return '1 000 000 ₽';
  }

  return `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
}

function shuffleQuestions(questions: QuizQuestion[]) {
  const shuffledQuestions = [...questions];

  for (let index = shuffledQuestions.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledQuestions[index], shuffledQuestions[swapIndex]] = [shuffledQuestions[swapIndex], shuffledQuestions[index]];
  }

  return shuffledQuestions;
}

function isCorrectAnswer(question: QuizQuestion, optionIndex: number) {
  return !question.correctOptionIndexes || question.correctOptionIndexes.includes(optionIndex);
}

function getAudioContextConstructor() {
  const audioWindow = window as Window &
    typeof globalThis & {
      webkitAudioContext?: AudioContextConstructor;
    };

  return audioWindow.AudioContext ?? audioWindow.webkitAudioContext ?? null;
}

function FireworksCanvas({ active, grand = false }: { active: boolean; grand?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    let animationFrame = 0;
    let lastBurst = 0;
    let width = 0;
    let height = 0;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      age: number;
      life: number;
      size: number;
      color: string;
    }> = [];

    const palette = ['#ffeb6a', '#ff6b9f', '#57d8ff', '#ffffff', '#70e07b', '#ff9f43'];

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const burst = () => {
      const centerX = width * (grand ? 0.08 + Math.random() * 0.84 : 0.18 + Math.random() * 0.64);
      const centerY = height * (grand ? 0.08 + Math.random() * 0.52 : 0.12 + Math.random() * 0.34);
      const count = (grand ? 60 : 34) + Math.floor(Math.random() * (grand ? 34 : 18));

      for (let index = 0; index < count; index += 1) {
        const angle = (Math.PI * 2 * index) / count + Math.random() * 0.2;
        const speed = (grand ? 2.1 : 1.2) + Math.random() * (grand ? 4.2 : 3.1);

        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          age: 0,
          life: (grand ? 86 : 70) + Math.random() * (grand ? 54 : 38),
          size: (grand ? 2.1 : 1.7) + Math.random() * (grand ? 3.4 : 2.5),
          color: palette[Math.floor(Math.random() * palette.length)],
        });
      }
    };

    const draw = (timestamp: number) => {
      context.clearRect(0, 0, width, height);

      if (!lastBurst || timestamp - lastBurst > (grand ? 210 : 650)) {
        burst();
        lastBurst = timestamp;
      }

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.age += 1;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.035;
        particle.vx *= 0.992;

        const progress = particle.age / particle.life;
        if (progress >= 1) {
          particles.splice(index, 1);
          continue;
        }

        context.globalAlpha = 1 - progress;
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size * (1 - progress * 0.35), 0, Math.PI * 2);
        context.fill();
      }

      context.globalAlpha = 1;
      animationFrame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, [active, grand]);

  return <canvas className="fireworks-canvas" ref={canvasRef} aria-hidden="true" />;
}

function ConfettiCurtain() {
  return (
    <div className="confetti-curtain" aria-hidden="true">
      {Array.from({ length: 32 }).map((_, index) => (
        <span
          className="confetti-piece"
          key={index}
          style={
            {
              '--delay': `${(index % 11) * 0.18}s`,
              '--left': `${(index * 29) % 100}%`,
              '--duration': `${4.2 + (index % 7) * 0.35}s`,
              '--spin': `${index % 2 === 0 ? 1 : -1}`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function HostPortrait({ excited = false }: { excited?: boolean }) {
  return (
    <div className={`host-portrait ${excited ? 'host-portrait--excited' : ''}`} aria-hidden="true">
      <div className="host-portrait__halo" />
      <div className="host-portrait__hair" />
      <div className="host-portrait__head">
        <span className="host-portrait__eye host-portrait__eye--left" />
        <span className="host-portrait__eye host-portrait__eye--right" />
        <span className="host-portrait__nose" />
        <span className="host-portrait__mustache" />
        <span className="host-portrait__smile" />
      </div>
      <div className="host-portrait__body">
        <span className="host-portrait__bowtie" />
      </div>
      <div className="host-portrait__mic" />
    </div>
  );
}

function PencilPrize() {
  return (
    <div className="pencil-prize" aria-label="Apple Pencil USB-C">
      <div className="pencil-prize__sparkle pencil-prize__sparkle--one" />
      <div className="pencil-prize__sparkle pencil-prize__sparkle--two" />
      <div className="pencil-prize__body">
        <span className="pencil-prize__cap" />
        <span className="pencil-prize__logo">Pencil</span>
        <span className="pencil-prize__tip" />
      </div>
      <div className="pencil-prize__shadow" />
    </div>
  );
}

function WrappedGift({ opening = false }: { opening?: boolean }) {
  return (
    <div className={`wrapped-gift ${opening ? 'wrapped-gift--opening' : ''}`} aria-hidden="true">
      <div className="wrapped-gift__lid">
        <span className="wrapped-gift__bow wrapped-gift__bow--left" />
        <span className="wrapped-gift__bow wrapped-gift__bow--right" />
      </div>
      <div className="wrapped-gift__box">
        <span className="wrapped-gift__ribbon" />
      </div>
    </div>
  );
}

function PhotoCollage() {
  return (
    <div className="photo-collage" aria-label="Коллаж из фотографий Марины">
      {collagePhotos.map((photo, index) => (
        <div className={`photo-collage__tile photo-collage__tile--${index + 1}`} key={`photo-${index + 1}`}>
          {photo ? (
            <img src={photo} alt={`Фото Марины ${index + 1}`} />
          ) : (
            <span>Фото {index + 1}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [stage, setStage] = useState<Stage>('openingFireworks');
  const [activeQuestions, setActiveQuestions] = useState(() => shuffleQuestions(quizQuestions));
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [wheelRotation, setWheelRotation] = useState(202.5);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasWheelResult, setHasWheelResult] = useState(false);
  const [moneyIndex, setMoneyIndex] = useState(0);
  const [moneyLocked, setMoneyLocked] = useState(false);
  const [hostMessage, setHostMessage] = useState('В студии праздничный сектор. Решение за вами.');
  const [isOfferBumped, setIsOfferBumped] = useState(false);
  const [isPrizeNudged, setIsPrizeNudged] = useState(false);
  const [mustPickPrize, setMustPickPrize] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [hasSoundStarted, setHasSoundStarted] = useState(false);
  const [eggClicks, setEggClicks] = useState(0);
  const [isEasterEggOpen, setIsEasterEggOpen] = useState(false);
  const [hostLineIndex, setHostLineIndex] = useState(0);

  const audioKitRef = useRef<AudioKit | null>(null);
  const soundEnabledRef = useRef(isSoundEnabled);
  const hasSoundStartedRef = useRef(hasSoundStarted);
  const wheelTickTimerRef = useRef<number | null>(null);
  const prizeOpeningTimerRef = useRef<number | null>(null);
  const fireworksSoundTimerRef = useRef<number | null>(null);

  const currentQuestion = activeQuestions[quizIndex] ?? activeQuestions[0];
  const currentMoney = moneySteps[moneyIndex];
  const isMillion = currentMoney === 1_000_000;
  const isSoundActive = isSoundEnabled && hasSoundStarted;
  const isSoundArmed = isSoundEnabled && !hasSoundStarted;
  const celebrationLevel = celebrationLevels[stage];
  const selectedIsCorrect =
    selectedOption === null || !currentQuestion ? true : isCorrectAnswer(currentQuestion, selectedOption);

  const wheelGradient = useMemo(() => {
    const step = 360 / sectorColors.length;
    const stops = sectorColors
      .map((color, index) => `${color} ${index * step}deg ${(index + 1) * step}deg`)
      .join(', ');

    return `conic-gradient(from -22.5deg, ${stops})`;
  }, []);

  useEffect(() => {
    if (stage !== 'openingFireworks') {
      return;
    }

    const timeout = window.setTimeout(() => setStage('intro'), 4600);
    return () => window.clearTimeout(timeout);
  }, [stage]);

  useEffect(() => {
    soundEnabledRef.current = isSoundEnabled;
  }, [isSoundEnabled]);

  useEffect(() => {
    hasSoundStartedRef.current = hasSoundStarted;
  }, [hasSoundStarted]);

  useEffect(() => {
    if (!isOfferBumped) {
      return;
    }

    const timeout = window.setTimeout(() => setIsOfferBumped(false), 650);
    return () => window.clearTimeout(timeout);
  }, [isOfferBumped]);

  useEffect(() => {
    if (!isPrizeNudged) {
      return;
    }

    const timeout = window.setTimeout(() => setIsPrizeNudged(false), 760);
    return () => window.clearTimeout(timeout);
  }, [isPrizeNudged]);

  useEffect(() => {
    if (stage !== 'hostSpeech') {
      return;
    }

    setHostLineIndex(0);
    const timer = window.setInterval(() => {
      setHostLineIndex((value) => {
        if (value >= hostSpeechLines.length - 1) {
          window.clearInterval(timer);
          return value;
        }

        return value + 1;
      });
    }, 1250);

    return () => window.clearInterval(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'openingFireworks' || !hasSoundStarted || !isSoundEnabled) {
      if (fireworksSoundTimerRef.current !== null) {
        window.clearInterval(fireworksSoundTimerRef.current);
        fireworksSoundTimerRef.current = null;
      }

      return;
    }

    const playFireworkBurst = () => {
      playTone(58 + Math.random() * 34, 0.46, 'sine', 0.2);
      playTone(92 + Math.random() * 44, 0.22, 'sawtooth', 0.05, 0.03);
      playTone(740 + Math.random() * 420, 0.08, 'triangle', 0.045, 0.12);
      playTone(980 + Math.random() * 520, 0.06, 'triangle', 0.035, 0.2);
    };

    playFireworkBurst();
    fireworksSoundTimerRef.current = window.setInterval(playFireworkBurst, 620);

    return () => {
      if (fireworksSoundTimerRef.current !== null) {
        window.clearInterval(fireworksSoundTimerRef.current);
        fireworksSoundTimerRef.current = null;
      }
    };
  }, [hasSoundStarted, isSoundEnabled, stage]);

  useEffect(() => {
    return () => {
      if (wheelTickTimerRef.current !== null) {
        window.clearInterval(wheelTickTimerRef.current);
      }

      if (fireworksSoundTimerRef.current !== null) {
        window.clearInterval(fireworksSoundTimerRef.current);
      }

      if (prizeOpeningTimerRef.current !== null) {
        window.clearTimeout(prizeOpeningTimerRef.current);
      }

      const kit = audioKitRef.current;
      if (kit) {
        if (kit.musicTimer) {
          window.clearInterval(kit.musicTimer);
        }

        void kit.context.close();
      }
    };
  }, []);

  const createAudioKit = () => {
    if (audioKitRef.current) {
      return audioKitRef.current;
    }

    const AudioContextClass = getAudioContextConstructor();
    if (!AudioContextClass) {
      return null;
    }

    const context = new AudioContextClass();
    const masterGain = context.createGain();
    const musicGain = context.createGain();
    const effectsGain = context.createGain();

    masterGain.gain.value = 0.68;
    musicGain.gain.value = 0.045;
    effectsGain.gain.value = 0.42;

    musicGain.connect(masterGain);
    effectsGain.connect(masterGain);
    masterGain.connect(context.destination);

    audioKitRef.current = {
      context,
      effectsGain,
      masterGain,
      musicGain,
    };

    return audioKitRef.current;
  };

  const playTone = (
    frequency: number,
    duration = 0.12,
    type: OscillatorType = 'sine',
    volume = 0.12,
    delay = 0,
    destination: GainNode | null = null,
  ) => {
    const kit = audioKitRef.current;
    if (!kit || !soundEnabledRef.current) {
      return;
    }

    const { context } = kit;
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0002), start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gain);
    gain.connect(destination ?? kit.effectsGain);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.04);
  };

  const startMusic = (kit: AudioKit) => {
    if (kit.musicTimer) {
      return;
    }

    const melody = [523.25, 659.25, 783.99, 1046.5, 987.77, 783.99, 659.25, 587.33];
    let step = 0;

    const playMusicNote = () => {
      if (!soundEnabledRef.current) {
        return;
      }

      const frequency = melody[step % melody.length];
      playTone(frequency, 0.42, 'triangle', 0.16, 0, kit.musicGain);
      playTone(frequency / 2, 0.52, 'sine', 0.08, 0.01, kit.musicGain);
      step += 1;
    };

    playMusicNote();
    kit.musicTimer = window.setInterval(playMusicNote, 620);
  };

  const startSound = () => {
    if (!soundEnabledRef.current) {
      return;
    }

    const kit = createAudioKit();
    if (!kit) {
      return;
    }

    if (kit.context.state === 'suspended') {
      void kit.context.resume();
    }

    kit.masterGain.gain.setTargetAtTime(0.68, kit.context.currentTime, 0.05);
    startMusic(kit);
    hasSoundStartedRef.current = true;
    setHasSoundStarted(true);
  };

  const stopSound = () => {
    const kit = audioKitRef.current;
    if (!kit) {
      return;
    }

    if (kit.musicTimer) {
      window.clearInterval(kit.musicTimer);
      kit.musicTimer = undefined;
    }

    kit.masterGain.gain.setTargetAtTime(0.0001, kit.context.currentTime, 0.05);
    hasSoundStartedRef.current = false;
    setHasSoundStarted(false);
  };

  useEffect(() => {
    const startOnFirstInteraction = () => {
      if (soundEnabledRef.current && !hasSoundStartedRef.current) {
        startSound();
      }
    };

    window.addEventListener('pointerdown', startOnFirstInteraction, { passive: true });
    window.addEventListener('keydown', startOnFirstInteraction);
    window.addEventListener('touchstart', startOnFirstInteraction, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', startOnFirstInteraction);
      window.removeEventListener('keydown', startOnFirstInteraction);
      window.removeEventListener('touchstart', startOnFirstInteraction);
    };
  }, []);

  const toggleSound = () => {
    if (isSoundEnabled && hasSoundStarted) {
      soundEnabledRef.current = false;
      setIsSoundEnabled(false);
      stopSound();
      return;
    }

    soundEnabledRef.current = true;
    setIsSoundEnabled(true);
    startSound();
    window.setTimeout(() => {
      playTone(659.25, 0.08, 'triangle', 0.08);
      playTone(987.77, 0.16, 'triangle', 0.08, 0.08);
    }, 30);
  };

  const playStartSound = () => {
    playTone(523.25, 0.09, 'triangle', 0.12);
    playTone(659.25, 0.11, 'triangle', 0.12, 0.08);
    playTone(1046.5, 0.2, 'triangle', 0.14, 0.18);
  };

  const playAnswerSound = () => {
    playTone(659.25, 0.08, 'triangle', 0.08);
    playTone(880, 0.12, 'triangle', 0.09, 0.08);
  };

  const playPrizeBumpSound = () => {
    playTone(440, 0.08, 'square', 0.05);
    playTone(660, 0.1, 'triangle', 0.08, 0.08);
    playTone(880, 0.14, 'triangle', 0.08, 0.16);
  };

  const playBankRaiseSound = () => {
    playTone(246.94, 0.08, 'square', 0.06);
    playTone(329.63, 0.08, 'square', 0.065, 0.08);
    playTone(493.88, 0.12, 'triangle', 0.08, 0.16);
    playTone(987.77, 0.18, 'sine', 0.1, 0.26);
  };

  const playBlockedSound = () => {
    playTone(220, 0.1, 'sawtooth', 0.05);
    playTone(146.83, 0.18, 'sawtooth', 0.04, 0.09);
  };

  const playPrizeRevealSound = () => {
    playTone(587.33, 0.08, 'triangle', 0.1);
    playTone(783.99, 0.08, 'triangle', 0.1, 0.08);
    playTone(1174.66, 0.26, 'sine', 0.12, 0.18);
  };

  const playMoneyFailSound = () => {
    playTone(392, 0.12, 'square', 0.06);
    playTone(261.63, 0.18, 'sawtooth', 0.045, 0.13);
  };

  const playGiftOpenSound = () => {
    playTone(392, 0.1, 'triangle', 0.08);
    playTone(587.33, 0.12, 'triangle', 0.09, 0.1);
    playTone(783.99, 0.16, 'triangle', 0.1, 0.22);
    playTone(1174.66, 0.34, 'sine', 0.12, 0.38);
  };

  const playEasterEggSound = () => {
    playTone(523.25, 0.08, 'triangle', 0.08);
    playTone(783.99, 0.1, 'triangle', 0.1, 0.09);
    playTone(1046.5, 0.18, 'sine', 0.12, 0.2);
  };

  const tapAge = () => {
    startSound();
    setEggClicks((value) => {
      const nextValue = value + 1;

      if (nextValue >= 5) {
        setIsEasterEggOpen(true);
        playEasterEggSound();
        return 0;
      }

      playTone(523.25 + nextValue * 55, 0.045, 'triangle', 0.04);
      return nextValue;
    });
  };

  const playWheelSpinSound = () => {
    if (!soundEnabledRef.current || !audioKitRef.current) {
      return;
    }

    if (wheelTickTimerRef.current !== null) {
      window.clearInterval(wheelTickTimerRef.current);
    }

    let tick = 0;
    wheelTickTimerRef.current = window.setInterval(() => {
      playTone(170 + (tick % 9) * 18, 0.026, 'square', 0.035);
      tick += 1;
    }, 86);

    window.setTimeout(() => {
      if (wheelTickTimerRef.current !== null) {
        window.clearInterval(wheelTickTimerRef.current);
        wheelTickTimerRef.current = null;
      }
    }, 4200);
  };

  const moveToQuiz = () => {
    startSound();
    playStartSound();
    setStage('quiz');
  };

  const chooseQuizOption = (optionIndex: number) => {
    if (selectedOption !== null) {
      return;
    }

    setSelectedOption(optionIndex);
    playAnswerSound();
  };

  const goToNextQuestion = () => {
    playTone(493.88, 0.06, 'triangle', 0.055);

    if (quizIndex === quizQuestions.length - 1) {
      setStage('hostSpeech');
      return;
    }

    setQuizIndex((value) => value + 1);
    setSelectedOption(null);
  };

  const spinWheel = () => {
    if (isSpinning || hasWheelResult) {
      return;
    }

    setIsSpinning(true);
    startSound();
    playWheelSpinSound();
    setWheelRotation(360 * 7);

    window.setTimeout(() => {
      setIsSpinning(false);
      setHasWheelResult(true);
      playPrizeRevealSound();
      window.setTimeout(() => setStage('sectorPrize'), 1400);
    }, 4300);
  };

  const bumpMoneyOffer = (message: string) => {
    setHostMessage(message);
    setIsOfferBumped(true);
    setMoneyIndex((value) => Math.min(value + 1, moneySteps.length - 1));
  };

  const choosePrize = () => {
    if (moneyLocked) {
      playGiftOpenSound();
      setStage('prizeOpening');
      prizeOpeningTimerRef.current = window.setTimeout(() => {
        playPrizeRevealSound();
        setStage('final');
      }, 2800);
      return;
    }

    setMustPickPrize(false);

    if (moneyIndex < moneySteps.length - 1) {
      playBankRaiseSound();
      bumpMoneyOffer('А может всё-таки деньги? Ставка растёт только после выбора приза.');
      return;
    }

    playPrizeBumpSound();
    setHostMessage('А может всё-таки деньги? Тут уже миллион на табло.');
    setIsOfferBumped(true);
  };

  const chooseMoney = () => {
    if (moneyLocked) {
      return;
    }

    if (!isMillion) {
      playBlockedSound();
      setMustPickPrize(true);
      setIsPrizeNudged(true);
      setHostMessage(`${wifeName}, банк отклонил такую скромную сумму. Чтобы торг продолжился, нужно открыть приз.`);
      if ('vibrate' in navigator) {
        navigator.vibrate(35);
      }
      return;
    }

    playPrizeBumpSound();
    setStage('moneyLoading');
    window.setTimeout(() => {
      setMoneyLocked(true);
      playMoneyFailSound();
      setHostMessage('Что-то пошло не так, деньги пропали. Остался честный приз.');
      setStage('offer');
    }, 5000);
  };

  return (
    <main className={`app-shell app-shell--${stage}`}>
      <FireworksCanvas
        active={stage === 'openingFireworks' || stage === 'intro' || stage === 'sectorPrize' || stage === 'final'}
        grand={stage === 'openingFireworks'}
      />
      <ConfettiCurtain />
      <div className="celebration-meter" aria-label={`Уровень праздничности ${celebrationLevel}%`}>
        <div className="celebration-meter__top">
          <span>Уровень праздничности</span>
          <strong>{celebrationLevel}%</strong>
        </div>
        <div className="celebration-meter__bar" aria-hidden="true">
          <span style={{ width: `${celebrationLevel}%` }} />
        </div>
      </div>

      <section className="experience" aria-live="polite">
        {stage === 'openingFireworks' && (
          <div className="opening-fireworks stage-panel">
            <div className="opening-fireworks__flare">
              <Sparkles size={34} />
            </div>
            <p>Праздничный салют для</p>
            <h1>Марины</h1>
            <button className="opening-fireworks__age" type="button" onClick={tapAge} aria-label="27 лет">
              27
            </button>
            <button className="sound-start-button" type="button" onClick={toggleSound}>
              {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              {isSoundActive ? 'Музыка играет' : isSoundEnabled ? 'Музыка включена' : 'Включить музыку'}
            </button>
          </div>
        )}

        {stage === 'intro' && (
          <div className="intro-stage">
            <div className="intro-stage__content">
              <div className="intro-stage__badge">
                <PartyPopper size={18} />
                День рождения · 27 лет
              </div>
              <button className="intro-stage__number" type="button" onClick={tapAge} aria-label="27 лет">
                <span>2</span>
                <span>7</span>
              </button>
              <h1>{wifeName}, с днем рождения!</h1>
              <p>
                Сегодня вся сцена, фейерверки, любимые места и главный приз работают только для тебя.
              </p>
              <button className="primary-button primary-button--large" type="button" onClick={moveToQuiz}>
                <Sparkles size={20} />
                Начать праздник
              </button>
            </div>
            <PhotoCollage />
          </div>
        )}

        {stage === 'quiz' && (
          <div className="quiz-stage stage-panel">
            <div className="stage-kicker">
              <WandSparkles size={18} />
              Раунд {quizIndex + 1} из {activeQuestions.length}
            </div>
            <div className="quiz-progress" aria-hidden="true">
              {activeQuestions.map((_, index) => (
                <span
                  className={index <= quizIndex ? 'quiz-progress__dot quiz-progress__dot--active' : 'quiz-progress__dot'}
                  key={index}
                />
              ))}
            </div>
            <h2>{currentQuestion.question}</h2>
            <div className={`quiz-options ${currentQuestion.optionImages ? 'quiz-options--visual' : ''}`}>
              {currentQuestion.options.map((option, optionIndex) => (
                <button
                  className={
                    `${
                      selectedOption !== null && isCorrectAnswer(currentQuestion, optionIndex) && selectedOption !== optionIndex
                        ? 'quiz-option quiz-option--answer'
                        : selectedOption === optionIndex && isCorrectAnswer(currentQuestion, optionIndex)
                          ? 'quiz-option quiz-option--selected'
                          : selectedOption === optionIndex
                            ? 'quiz-option quiz-option--wrong'
                            : selectedOption !== null
                              ? 'quiz-option quiz-option--muted'
                              : 'quiz-option'
                    }${currentQuestion.optionImages?.[optionIndex] ? ' quiz-option--with-image' : ''}`
                  }
                  key={option}
                  type="button"
                  onClick={() => chooseQuizOption(optionIndex)}
                >
                  {currentQuestion.optionImages?.[optionIndex] && (
                    <img
                      className="quiz-option__image"
                      src={currentQuestion.optionImages[optionIndex] ?? undefined}
                      alt=""
                      loading="lazy"
                    />
                  )}
                  <span>{option}</span>
                  {selectedOption !== null && isCorrectAnswer(currentQuestion, optionIndex) && <CheckCircle2 size={20} />}
                </button>
              ))}
            </div>
            {selectedOption !== null && (
              <div className={`quiz-result ${selectedIsCorrect ? '' : 'quiz-result--wrong'}`}>
                <Heart size={20} />
                <span>{selectedIsCorrect ? currentQuestion.punchline : currentQuestion.wrongPunchline}</span>
              </div>
            )}
            <button
              className="primary-button quiz-stage__next"
              type="button"
              disabled={selectedOption === null}
              onClick={goToNextQuestion}
            >
              {quizIndex === activeQuestions.length - 1 ? 'К барабану' : 'Дальше'}
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {stage === 'hostSpeech' && (
          <div className="host-speech-stage stage-panel">
            <div className="host-speech-stage__host">
              <HostPortrait excited />
            </div>
            <div className="stage-kicker">
              <Trophy size={18} />
              Минутка ведущего
            </div>
            <h2>Перед барабаном</h2>
            <div className="host-speech-lines">
              {hostSpeechLines.slice(0, hostLineIndex + 1).map((line, index) => (
                <p className="host-speech-line" key={line} style={{ '--line-index': index } as CSSProperties}>
                  {line}
                </p>
              ))}
            </div>
            <button className="primary-button primary-button--large" type="button" onClick={() => setStage('wheel')}>
              <RotateCcw size={20} />
              К барабану
            </button>
          </div>
        )}

        {stage === 'wheel' && (
          <div className="wheel-stage">
            <div className="wheel-stage__copy">
              <div className="stage-kicker">
                <Trophy size={18} />
                Поле чудес
              </div>
              <h2>Крутите барабан</h2>
              <p>
                Ведущий уже хитро улыбается, а барабан явно знает, где лежит приз для Марины.
              </p>
              <div className="host-card">
                <HostPortrait excited={hasWheelResult} />
                <div>
                  <strong>Леонид Аркадьевич почти настоящий</strong>
                  <span>
                    {hasWheelResult ? 'Сектор «приз» на барабане.' : 'Внимание, сейчас будет вращение.'}
                  </span>
                </div>
              </div>
              <button
                className="primary-button primary-button--large"
                type="button"
                onClick={spinWheel}
                disabled={isSpinning || hasWheelResult}
              >
                <RotateCcw size={20} />
                {isSpinning ? 'Барабан крутится' : hasWheelResult ? 'Сектор «приз»' : 'Крутить барабан'}
              </button>
            </div>

            <div className="wheel-stage__machine">
              <div className="wheel-pointer" aria-hidden="true" />
              <div
                className={`wheel ${isSpinning ? 'wheel--spinning' : ''}`}
                style={
                  {
                    '--wheel-rotation': `${wheelRotation}deg`,
                    background: wheelGradient,
                    } as CSSProperties
                }
              >
                {sectors.map((sector, index) => (
                  <span
                    className="wheel__label"
                    key={sector}
                    style={{ '--sector-angle': `${index * 45 + 22.5}deg` } as CSSProperties}
                  >
                    {sector}
                  </span>
                ))}
                <div className="wheel__center">
                  <span>27</span>
                </div>
              </div>
              {hasWheelResult && (
                <div className="wheel-result">
                  <Sparkles size={20} />
                  Сектор «приз» на барабане
                </div>
              )}
            </div>
          </div>
        )}

        {stage === 'sectorPrize' && (
          <div className="sector-prize-stage stage-panel">
            <div className="sector-prize-stage__burst">
              <Sparkles size={38} />
            </div>
            <div className="stage-kicker">
              <Trophy size={18} />
              Выпал сектор
            </div>
            <h2>Сектор «приз» на барабане</h2>
            <p>
              Студия замирает, ведущий делает паузу, а у Марины появляется право на главный выбор.
            </p>
            <button className="primary-button primary-button--large" type="button" onClick={() => setStage('offer')}>
              <Gift size={20} />
              Перейти к выбору
            </button>
          </div>
        )}

        {stage === 'offer' && (
          <div className="offer-stage">
            <div className={`tv-board ${isOfferBumped ? 'tv-board--raise' : ''}`}>
              <div className="tv-board__lights" aria-hidden="true">
                {Array.from({ length: 10 }).map((_, index) => (
                  <span key={index} />
                ))}
              </div>
              <div className="tv-board__panel">
                <span className="tv-board__label">Банк предлагает</span>
                <strong>{moneyLocked ? 'Опция закрыта' : formatMoney(currentMoney)}</strong>
                <p>
                  {moneyLocked
                    ? 'Денежный сектор погас. Осталась коробка с настоящим призом.'
                    : isMillion
                      ? 'Финальная ставка. Миллион выглядит слишком уверенно.'
                      : 'Ставка повышается только после выбора приза.'}
                </p>
              </div>
              <div className="tv-board__ticker" aria-hidden="true">
                <span>Поле чудес · банк повышает предложение · сектор приз · Марина выбирает · </span>
              </div>
            </div>
            <div className="offer-stage__header">
              <HostPortrait excited={moneyLocked || isMillion} />
              <div>
                <div className="stage-kicker">
                  <Gift size={18} />
                  Выбор финала
                </div>
                <h2>Деньги или приз?</h2>
                <p>{hostMessage}</p>
              </div>
            </div>

            <div className="choice-grid">
              <article
                className={`choice-card choice-card--money ${isOfferBumped ? 'choice-card--bump' : ''} ${
                  mustPickPrize ? 'choice-card--blocked' : ''
                }`}
              >
                <div className="choice-card__icon choice-card__icon--money">
                  {moneyLocked ? <LockKeyhole size={28} /> : <RussianRuble size={30} />}
                </div>
                <div className="choice-card__content">
                  <span className="choice-card__label">Деньги</span>
                  <strong>{moneyLocked ? 'Опция заблокирована' : formatMoney(currentMoney)}</strong>
                  <p>
                    {moneyLocked
                      ? 'Перевод пытался быть серьезным, но праздник решил иначе.'
                      : isMillion
                        ? 'Последний шанс поверить в банковскую магию.'
                        : mustPickPrize
                          ? 'Банк замер. Теперь ход только через подарок.'
                          : 'Сумма на табло растет только если сначала выбрать приз.'}
                  </p>
                </div>
                <button
                  className="secondary-button"
                  type="button"
                  disabled={moneyLocked || mustPickPrize}
                  onClick={chooseMoney}
                >
                  <CreditCard size={18} />
                  {mustPickPrize ? 'Сначала приз' : isMillion ? 'Взять миллион' : 'Выбрать деньги'}
                </button>
              </article>

              <article className={`choice-card choice-card--prize ${isPrizeNudged ? 'choice-card--nudge' : ''}`}>
                <div className="choice-card__visual">
                  <WrappedGift />
                </div>
                <div className="choice-card__content">
                  <span className="choice-card__label">Приз</span>
                  <strong>{moneyLocked ? 'Финальная коробка' : 'Таинственная коробка'}</strong>
                  <p>
                    {moneyLocked
                      ? 'Деньги исчезли, но коробка всё ещё закрыта. Самое время открыть её красиво.'
                      : 'Каждый выбор приза заставляет ведущего поднимать денежную ставку.'}
                  </p>
                </div>
                <button className="primary-button" type="button" onClick={choosePrize}>
                  <Gift size={18} />
                  {moneyLocked ? 'Открыть приз' : 'Выбрать приз'}
                </button>
              </article>
            </div>
          </div>
        )}

        {stage === 'moneyLoading' && (
          <div className="loading-stage stage-panel">
            <div className="loading-stage__icon">
              <CreditCard size={38} />
            </div>
            <h2>Отправляем деньги на вашу карту...</h2>
            <div className="loading-bar" aria-hidden="true">
              <span />
            </div>
            <p>Проверяем праздничный межбанковский канал. Это займет пару секунд.</p>
          </div>
        )}

        {stage === 'prizeOpening' && (
          <div className="prize-opening-stage stage-panel">
            <WrappedGift opening />
            <div className="stage-kicker">
              <Gift size={18} />
              Открываем подарок
            </div>
            <h2>Сейчас будет настоящий приз</h2>
            <p>Коробка сдаётся, лента улетает, интрига держится до последней секунды.</p>
          </div>
        )}

        {stage === 'final' && (
          <div className="final-stage stage-panel">
            <div className="final-stage__pencil">
              <PencilPrize />
            </div>
            <div className="stage-kicker">
              <Sparkles size={18} />
              Главный приз
            </div>
            <h2>Apple Pencil USB-C твой</h2>
            <p>
              Деньги вели себя подозрительно, а подарок оказался настоящим. С днем рождения,
              Марина. Пусть 27 будет красивым, легким и очень счастливым годом.
            </p>
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setStage('openingFireworks');
                setActiveQuestions(shuffleQuestions(quizQuestions));
                setQuizIndex(0);
                setSelectedOption(null);
                setWheelRotation(202.5);
                setIsSpinning(false);
                setHasWheelResult(false);
                setMoneyIndex(0);
                setMoneyLocked(false);
                setHostMessage('В студии праздничный сектор. Решение за вами.');
                setMustPickPrize(false);
                setIsEasterEggOpen(false);
                setEggClicks(0);
              }}
            >
              <PartyPopper size={18} />
              Посмотреть еще раз
            </button>
          </div>
        )}
      </section>

      <button
        className={`sound-toggle ${isSoundEnabled ? 'sound-toggle--active' : ''} ${
          isSoundArmed ? 'sound-toggle--armed' : ''
        }`}
        type="button"
        onClick={toggleSound}
        aria-label={isSoundActive ? 'Выключить звук' : isSoundArmed ? 'Запустить музыку' : 'Включить звук'}
        title={isSoundActive ? 'Выключить звук' : isSoundArmed ? 'Музыка включится после первого клика' : 'Включить звук'}
      >
        {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>

      {isEasterEggOpen && (
        <div className="easter-egg" role="dialog" aria-modal="true" aria-label="Секретное послание">
          <div className="easter-egg__card">
            <div className="easter-egg__icon">
              <Heart size={28} />
            </div>
            <span>Секретный сектор 27</span>
            <h2>Марина, я тебя люблю</h2>
            <p>
              Если ты нашла это послание, значит праздничная магия работает. Ты мой самый
              любимый человек, и этот день сделан для твоей улыбки.
            </p>
            <button className="primary-button" type="button" onClick={() => setIsEasterEggOpen(false)}>
              <Sparkles size={18} />
              Вернуться к празднику
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
