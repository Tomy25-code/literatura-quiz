import ModeSelector from './ModeSelector';
import StatsSummary from './StatsSummary';
import TodayPlan from './TodayPlan';
import { VALID_LENGTHS } from '../utils/settings';

export default function Home({
  authorCount,
  workCount,
  questionCount,
  wrongCount,
  quizLength,
  stats,
  weakSpotsActive,
  dailyCompletedToday,
  dailyStreak,
  todayPlanRecs,
  onSelectMode,
  onTodayPlanAction,
  onSetQuizLength,
  onClearWrong,
  onViewStats,
}) {
  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Матура БЕЛ Quiz</h1>
        <p className="home-subtitle">
          Подготви се за матурата по български език и литература. Тествай знанията
          си за автори, произведения, жанрове, периоди, теми и композиция.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{authorCount}</span>
          <span className="stat-label">Автори</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{workCount}</span>
          <span className="stat-label">Произведения</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{questionCount}</span>
          <span className="stat-label">Въпроса</span>
        </div>
      </div>

      <div className="quiz-length-picker">
        <span className="qlp-label">Брой въпроси в тест</span>
        <div className="qlp-options">
          {VALID_LENGTHS.map(n => (
            <button
              key={n}
              className={`qlp-btn${quizLength === n ? ' active' : ''}`}
              onClick={() => onSetQuizLength(n)}
              aria-pressed={quizLength === n}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <StatsSummary stats={stats} onViewStats={onViewStats} />

      <TodayPlan recommendations={todayPlanRecs} onAction={onTodayPlanAction} />

      <ModeSelector
        onSelect={onSelectMode}
        wrongCount={wrongCount}
        onClearWrong={onClearWrong}
        weakSpotsActive={weakSpotsActive}
        dailyCompletedToday={dailyCompletedToday}
        dailyStreak={dailyStreak}
      />

      <details className="help-section">
        <summary className="help-summary">Как да използваш сайта?</summary>
        <div className="help-body">

          <p className="help-p">
            Сайтът помага за подготовка за матурата по БЕЛ — чрез тестове, умна практика,
            флашкарти, справочник и статистика. Работи изцяло в браузъра без регистрация.
            Напредъкът ти се запазва автоматично на устройството.
          </p>

          <div className="help-divider" />

          <div className="help-group">
            <p className="help-group-title">1. Избери дължина на теста</p>
            <p className="help-p">
              С бутоните 5 / 10 / 15 / 20 задаваш колко въпроса да съдържа следващият тест.
              Специализирани режими като „Избери теза" могат да предложат по-малко въпроси,
              ако в базата данни за дадения тип има по-малко от избрания брой.
            </p>
          </div>

          <div className="help-group">
            <p className="help-group-title">2. Какво да уча днес?</p>
            <p className="help-p">
              Секцията „Какво да уча днес?" предлага кратък план според досегашните ти резултати.
              Може да ти препоръча преговор на грешните, дневна тренировка, слаба категория,
              слаб автор, слабо произведение, флашкарти или справочник. Самото разглеждане на
              плана не променя статистиката ти.
            </p>
          </div>

          <div className="help-group">
            <p className="help-group-title">3. Основни режими на тест</p>
            <p className="help-p">Всеки от тези режими стартира тест незабавно или след избор на филтър:</p>
            <ul className="help-ul">
              <li><strong>„Случаен тест"</strong> — смес от въпроси за всички автори и теми</li>
              <li><strong>„Тест по автор"</strong> — само въпроси за избрания автор</li>
              <li><strong>„Тест по произведение"</strong> — само въпроси за едно произведение</li>
              <li><strong>„Тест по категория"</strong> — жанр, период, теми, композиция, мотиви и др.</li>
              <li><strong>„Тест по трудност"</strong> — лесно, средно или трудно</li>
            </ul>
          </div>

          <div className="help-group">
            <p className="help-group-title">4. Видове въпроси</p>
            <p className="help-p">В зависимост от режима въпросите могат да бъдат:</p>
            <ul className="help-ul">
              <li>с четири варианта за избор</li>
              <li>вярно / невярно</li>
              <li>свържи автор с произведение (всички двойки трябва да са верни)</li>
              <li>попълни липсваща дума с клавиатура</li>
              <li>разпознаване на произведение по теми или мотиви</li>
              <li>избор на подходяща теза за интерпретативно съчинение</li>
            </ul>
          </div>

          <div className="help-divider" />

          <div className="help-group">
            <p className="help-group-title">5. Умна практика</p>
            <ul className="help-ul">
              <li>
                <strong>„Дневна тренировка"</strong> — кратък балансиран тест за деня, съставен
                от сгрешени въпроси, слаби теми и произволни въпроси. Упражнявай се всеки ден,
                за да поддържаш серията си.
              </li>
              <li>
                <strong>„Слаби места"</strong> — автоматично открива категориите и трудностите,
                в които имаш под 70% верни отговори (при поне 10 отговорени въпроса), и те тренира
                именно там.
              </li>
              <li>
                <strong>„Преговор на грешните"</strong> — всеки сгрешен въпрос се запазва в опашката
                за преговор. Въпросът се счита за усвоен едва след два верни отговора подред в режим
                „Преговор на грешните" или „Слаби места".
              </li>
            </ul>
          </div>

          <div className="help-divider" />

          <div className="help-group">
            <p className="help-group-title">6. Справочник и флашкарти</p>
            <ul className="help-ul">
              <li>
                <strong>„Флашкарти"</strong> — справочни карти за всеки автор и произведение;
                удобни за бърз преговор на жанрове, периоди и композиция.
              </li>
              <li>
                <strong>„Падна ми се автор/произведение"</strong> — отваря структурирана справочна карта
                за избран автор или произведение с период, литературен контекст, теми, ключови факти
                и произведения. Не влияе на статистиката или преговора на грешни.
              </li>
            </ul>
          </div>

          <div className="help-group">
            <p className="help-group-title">7. Подготовка за съчинение</p>
            <p className="help-p">
              <strong>„Избери теза"</strong> — тест само с въпроси от тип „Кой акцент е подходящ
              за интерпретативно съчинение?". Помага да упражниш избора на теза преди писмена работа.
            </p>
          </div>

          <div className="help-divider" />

          <div className="help-group">
            <p className="help-group-title">8. Статистика и напредък</p>
            <p className="help-p">
              След всеки завършен тест статистиката се обновява автоматично. От бутона „Статистика"
              виждаш общия брой тестове, средния и най-добрия резултат, точността по трудност и
              категория, и последните опити.
            </p>
            <p className="help-p">
              В статистиката виждаш и най-слабите автори и произведения. Те се показват само
              когато има достатъчно отговорени въпроси. С бутона „Тест →" можеш веднага да
              започнеш насочен преговор.
            </p>
          </div>

          <div className="help-divider" />

          <div className="help-group">
            <p className="help-group-title">Препоръчителен начин на учене</p>
            <ol className="help-ol">
              <li>Започни с „Случаен тест" — виж общото ниво.</li>
              <li>Провери „Какво да уча днес?" за насочен план.</li>
              <li>Прегледай грешките в „Преговор на грешните".</li>
              <li>Използвай „Слаби места" за целенасочена практика.</li>
              <li>Прави „Дневна тренировка" редовно, за да поддържаш серията.</li>
              <li>Ползвай „Падна ми се автор/произведение" и „Флашкарти" преди преговор или писмена работа.</li>
              <li>Упражнявай избора на теза с „Избери теза".</li>
            </ol>
          </div>

          <div className="help-group">
            <p className="help-group-title">За данните</p>
            <p className="help-p">
              Всичко се пази само в браузъра на устройството ти — без регистрация, без сървър.
              Съдържанието на справочника отразява наличните полета в записките. Ако дадена секция
              не се вижда в картата, означава, че съответните данни не са посочени в изходния материал.
            </p>
          </div>

        </div>
      </details>
    </div>
  );
}
