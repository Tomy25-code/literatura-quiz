import { useState } from 'react';
import authors from './data/authors.json';
import works from './data/works.json';
import baseQuestions from './data/questions.json';
import variantQuestions from './data/questions.v2.json';
import typeQuestions from './data/questions.types.json';
import fillBlankQuestions from './data/questions.fillblank.json';
import recognitionQuestions from './data/questions.recognition.json';

const questions = [...baseQuestions, ...variantQuestions, ...typeQuestions, ...fillBlankQuestions, ...recognitionQuestions];
import Home from './components/Home';
import Quiz from './components/Quiz';
import Results from './components/Results';
import FilterSelection from './components/FilterSelection';
import FlashcardSelection from './components/FlashcardSelection';
import Flashcards from './components/Flashcards';
import StudyGuide from './components/StudyGuide';
import StudyGuideDetail from './components/StudyGuideDetail';
import { buildQuiz, buildThesisPracticeQuiz, shuffle, MODE_LABELS } from './utils/quiz';
import { buildTodayPlan } from './utils/todayPlan';
import { buildWeakSpotsQuiz, hasWeakSpots } from './utils/weakSpots';
import { buildDailyPracticeQuiz, getDailyPracticeState, saveDailyPracticeCompletion, getLocalDateKey } from './utils/dailyPractice';
import { buildAuthorCards, buildWorkCards, buildMixedCards } from './utils/flashcards';
import { getWrongQuestionIds, clearWrongQuestionIds, buildWrongReviewQuiz } from './utils/wrongAnswers';
import { getStoredQuizLength, storeQuizLength } from './utils/settings';
import { getStats, saveAttempt, clearStats, buildAttempt } from './utils/stats';
import StatsScreen from './components/StatsScreen';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [quizMode, setQuizMode] = useState('random');
  const [quizFilter, setQuizFilter] = useState(null);
  const [modeLabel, setModeLabel] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(() => getWrongQuestionIds().length);
  const [flashcardDeck, setFlashcardDeck] = useState([]);
  const [studyGuideItem, setStudyGuideItem] = useState(null);
  const [filterError, setFilterError] = useState('');
  const [quizLength, setQuizLength] = useState(() => getStoredQuizLength());
  const [stats, setStats] = useState(() => getStats());
  const [lastAttemptOverallAvg, setLastAttemptOverallAvg] = useState(null);
  const [dailyPracticeState, setDailyPracticeState] = useState(() => getDailyPracticeState());

  function handleSetQuizLength(n) {
    storeQuizLength(n);
    setQuizLength(n);
  }

  function startQuiz(mode, filterValue, label) {
    let qs;
    if (mode === 'wrong') {
      qs = buildWrongReviewQuiz({ questions, length: quizLength });
    } else if (mode === 'weakSpots') {
      const currentStats = getStats();
      if (currentStats.length === 0) {
        setScreen('weak-spots-empty');
        return;
      }
      const result = buildWeakSpotsQuiz({
        questions,
        wrongQuestionIds: getWrongQuestionIds(),
        stats: currentStats,
        length: quizLength,
      });
      if (result.emptyReason === 'no-weak-spots' || result.questions.length === 0) {
        setScreen('weak-spots-no-data');
        return;
      }
      qs = result.questions;
    } else if (mode === 'dailyPractice') {
      const result = buildDailyPracticeQuiz({
        questions,
        stats: getStats(),
        wrongQuestionIds: getWrongQuestionIds(),
        length: quizLength,
      });
      if (result.questions.length === 0) {
        setScreen('daily-practice-empty');
        return;
      }
      qs = result.questions;
    } else if (mode === 'thesisPractice') {
      const result = buildThesisPracticeQuiz({ allQuestions: questions, length: quizLength });
      if (result.emptyReason === 'no-thesis-questions' || result.questions.length === 0) {
        setScreen('thesis-practice-empty');
        return;
      }
      qs = result.questions;
    } else {
      qs = buildQuiz(questions, mode, filterValue, works, quizLength);
    }
    setQuizMode(mode);
    setQuizFilter(filterValue);
    setModeLabel(label);
    setQuizQuestions(qs);
    setScreen('quiz');
  }

  function handleModeSelect(mode) {
    setFilterError('');
    if (mode === 'random') {
      startQuiz('random', null, MODE_LABELS.random);
    } else if (mode === 'dailyPractice') {
      startQuiz('dailyPractice', null, MODE_LABELS.dailyPractice);
    } else if (mode === 'weakSpots') {
      startQuiz('weakSpots', null, MODE_LABELS.weakSpots);
    } else if (mode === 'wrong') {
      const current = getWrongQuestionIds().length;
      if (current === 0) {
        setScreen('wrong-empty');
      } else {
        startQuiz('wrong', null, MODE_LABELS.wrong);
      }
    } else if (mode === 'thesisPractice') {
      startQuiz('thesisPractice', null, MODE_LABELS.thesisPractice);
    } else if (mode === 'flashcards') {
      setScreen('flashcard-select');
    } else if (mode === 'studyGuide') {
      setScreen('study-guide');
    } else {
      setQuizMode(mode);
      setScreen('filter');
    }
  }

  function handleFilterSelect(filterValue, label) {
    const testPool = buildQuiz(questions, quizMode, filterValue, works, quizLength);
    if (testPool.length === 0) {
      setFilterError('Няма въпроси за този избор.');
      return;
    }
    setFilterError('');
    startQuiz(quizMode, filterValue, label);
  }

  function handleStudyGuideSelect(type, id) {
    setStudyGuideItem({ type, id });
    setScreen('study-guide-detail');
  }

  function goStudyGuide() {
    setScreen('study-guide');
  }

  function handleFlashcardTypeSelect(type) {
    let deck;
    if (type === 'author') deck = buildAuthorCards(authors, works);
    else if (type === 'work') deck = buildWorkCards(works, authors);
    else deck = buildMixedCards(authors, works);
    setFlashcardDeck(shuffle(deck));
    setScreen('flashcards');
  }

  function handleFinish(score, answeredMap) {
    const previousStats = getStats();
    const overallAvg = previousStats.length > 0
      ? Math.round(previousStats.reduce((sum, a) => sum + a.percentage, 0) / previousStats.length)
      : null;
    const attempt = buildAttempt({ quizMode, modeLabel, quizQuestions, score, answeredMap });
    saveAttempt(attempt);
    if (quizMode === 'dailyPractice') {
      saveDailyPracticeCompletion();
      setDailyPracticeState(getDailyPracticeState());
    }
    setStats(getStats());
    setFinalScore(score);
    setLastAttemptOverallAvg(overallAvg);
    setWrongCount(getWrongQuestionIds().length);
    setScreen('results');
  }

  function handleClearStats() {
    if (window.confirm('Сигурен/сигурна ли си, че искаш да изчистиш цялата статистика?')) {
      clearStats();
      setStats([]);
    }
  }

  function goStats() {
    setScreen('stats');
  }

  function handleRestart() {
    if (quizMode === 'wrong' && getWrongQuestionIds().length === 0) {
      goHome();
      return;
    }
    // weakSpots: startQuiz always rebuilds from fresh localStorage state.
    // If qualifying questions are exhausted it routes to the positive empty
    // screen instead of starting a quiz — no stale data, no random fallback.
    startQuiz(quizMode, quizFilter, modeLabel);
  }

  function handleClearWrong() {
    if (window.confirm('Сигурен/сигурна ли си, че искаш да изчистиш всички грешни въпроси?')) {
      clearWrongQuestionIds();
      setWrongCount(0);
    }
  }

  function handleTodayPlanAction(action) {
    if (action.type === 'mode') {
      handleModeSelect(action.modeId);
    } else if (action.type === 'category-quiz') {
      const pool = buildQuiz(questions, 'category', action.category, works, 5);
      if (pool.length === 0) {
        setQuizMode('category');
        setScreen('filter');
        return;
      }
      setQuizMode('category');
      setQuizFilter(action.category);
      setModeLabel(action.label);
      setQuizQuestions(pool);
      setScreen('quiz');
    } else if (action.type === 'study-guide') {
      handleStudyGuideSelect(action.itemType, action.itemId);
    }
  }

  function goHome() {
    setFilterError('');
    setWrongCount(getWrongQuestionIds().length);
    setScreen('home');
  }

  if (screen === 'wrong-empty') {
    return (
      <div className="wrong-empty-container">
        <h2 className="wrong-empty-title">Преговор на грешните</h2>
        <p className="wrong-empty-text">Все още няма грешни въпроси.</p>
        <p className="wrong-empty-sub">
          След като сгрешиш въпрос в тест, той ще се появи тук за преговор.
        </p>
        <button className="btn-primary" onClick={goHome}>Към началото</button>
      </div>
    );
  }

  if (screen === 'weak-spots-empty') {
    return (
      <div className="wrong-empty-container">
        <h2 className="wrong-empty-title">Все още няма достатъчно данни</h2>
        <p className="wrong-empty-sub">
          Завърши няколко теста, за да може приложението да открие слабите ти места.
        </p>
        <button className="btn-primary" onClick={goHome}>Към началото</button>
      </div>
    );
  }

  if (screen === 'weak-spots-no-data') {
    return (
      <div className="wrong-empty-container">
        <h2 className="wrong-empty-title">Няма открити слаби места</h2>
        <p className="wrong-empty-sub">
          Засега резултатите ти са достатъчно стабилни. Можеш да продължиш
          със случаен тест или тест по автор.
        </p>
        <button className="btn-primary" onClick={goHome}>Към началото</button>
      </div>
    );
  }

  if (screen === 'daily-practice-empty') {
    return (
      <div className="wrong-empty-container">
        <h2 className="wrong-empty-title">Дневна тренировка</h2>
        <p className="wrong-empty-sub">
          Няма налични въпроси за тренировка. Опитай друг режим.
        </p>
        <button className="btn-primary" onClick={goHome}>Към началото</button>
      </div>
    );
  }

  if (screen === 'thesis-practice-empty') {
    return (
      <div className="wrong-empty-container">
        <h2 className="wrong-empty-title">Няма налични въпроси за теза</h2>
        <p className="wrong-empty-sub">
          Добави или генерирай въпроси за подготовка на теза, за да използваш този режим.
        </p>
        <button className="btn-primary" onClick={goHome}>Към началото</button>
      </div>
    );
  }

  if (screen === 'filter') {
    return (
      <FilterSelection
        mode={quizMode}
        authors={authors}
        works={works}
        questions={questions}
        onSelect={handleFilterSelect}
        onBack={goHome}
        error={filterError}
      />
    );
  }

  if (screen === 'flashcard-select') {
    return (
      <FlashcardSelection
        authors={authors}
        works={works}
        onSelect={handleFlashcardTypeSelect}
        onBack={goHome}
      />
    );
  }

  if (screen === 'flashcards') {
    return (
      <Flashcards
        deck={flashcardDeck}
        onHome={goHome}
      />
    );
  }

  if (screen === 'study-guide') {
    return (
      <StudyGuide
        authors={authors}
        works={works}
        onSelect={handleStudyGuideSelect}
        onBack={goHome}
      />
    );
  }

  if (screen === 'study-guide-detail') {
    const { type, id } = studyGuideItem;
    const item = type === 'author'
      ? authors.find(a => a.id === id)
      : works.find(w => w.id === id);
    return (
      <StudyGuideDetail
        type={type}
        item={item}
        authors={authors}
        works={works}
        onBack={goStudyGuide}
        onNavigateToWork={workId => handleStudyGuideSelect('work', workId)}
      />
    );
  }

  if (screen === 'quiz') {
    return (
      <Quiz
        questions={quizQuestions}
        modeLabel={modeLabel}
        isWrongMode={quizMode === 'wrong'}
        isRemediationMode={quizMode === 'wrong' || quizMode === 'weakSpots'}
        onFinish={handleFinish}
        onHome={goHome}
      />
    );
  }

  if (screen === 'results') {
    return (
      <Results
        score={finalScore}
        total={quizQuestions.length}
        modeLabel={modeLabel}
        isWrongMode={quizMode === 'wrong'}
        wrongCount={wrongCount}
        overallAvg={lastAttemptOverallAvg}
        onRestart={handleRestart}
        onHome={goHome}
      />
    );
  }

  if (screen === 'stats') {
    return (
      <StatsScreen
        stats={stats}
        allQuestions={questions}
        authors={authors}
        works={works}
        onHome={goHome}
        onClearStats={handleClearStats}
        onStartQuiz={startQuiz}
      />
    );
  }

  const weakSpotsActive = hasWeakSpots({
    questions,
    wrongQuestionIds: getWrongQuestionIds(),
    stats,
  });

  const dailyCompletedToday = dailyPracticeState.lastDate === getLocalDateKey();
  const dailyStreak = dailyPracticeState.streak || 0;

  const todayPlanRecs = buildTodayPlan({
    stats,
    wrongQuestionIds: getWrongQuestionIds(),
    dailyCompletedToday,
    questions,
    authors,
  });

  return (
    <Home
      authorCount={authors.length}
      workCount={works.length}
      questionCount={questions.length}
      wrongCount={wrongCount}
      quizLength={quizLength}
      stats={stats}
      weakSpotsActive={weakSpotsActive}
      dailyCompletedToday={dailyCompletedToday}
      dailyStreak={dailyStreak}
      todayPlanRecs={todayPlanRecs}
      onSelectMode={handleModeSelect}
      onTodayPlanAction={handleTodayPlanAction}
      onSetQuizLength={handleSetQuizLength}
      onClearWrong={handleClearWrong}
      onViewStats={goStats}
    />
  );
}
