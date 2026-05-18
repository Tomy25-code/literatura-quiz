import { useState } from 'react';

const TABS = [
  { id: 'tests', label: 'Тестове' },
  { id: 'practice', label: 'Практика' },
  { id: 'cards', label: 'Справочник' },
  { id: 'stats', label: 'Статистика' },
  { id: 'help', label: 'Помощ' },
  { id: 'settings', label: 'Настройки' },
];

export default function HomeNavigation({
  onSelect,
  wrongCount,
  onClearWrong,
  weakSpotsActive,
  dailyCompletedToday,
  dailyStreak,
  onViewStats,
  theme,
  onSetTheme,
}) {
  const [activeTab, setActiveTab] = useState('tests');

  return (
    <div className="home-nav">
      <p className="home-nav-heading">Избери раздел</p>

      <div className="home-nav-tabs" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`home-nav-tab${activeTab === tab.id ? ' home-nav-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="home-nav-panel">
        {activeTab === 'tests' && (
          <TestsPanel onSelect={onSelect} />
        )}
        {activeTab === 'practice' && (
          <PracticePanel
            onSelect={onSelect}
            wrongCount={wrongCount}
            onClearWrong={onClearWrong}
            weakSpotsActive={weakSpotsActive}
            dailyCompletedToday={dailyCompletedToday}
            dailyStreak={dailyStreak}
          />
        )}
        {activeTab === 'cards' && (
          <CardsPanel onSelect={onSelect} />
        )}
        {activeTab === 'stats' && (
          <StatsPanel onViewStats={onViewStats} />
        )}
        {activeTab === 'help' && (
          <HelpPanel />
        )}
        {activeTab === 'settings' && (
          <SettingsPanel theme={theme} onSetTheme={onSetTheme} />
        )}
      </div>
    </div>
  );
}

function TestsPanel({ onSelect }) {
  const modes = [
    { id: 'random', label: 'Случаен тест', desc: 'Въпроси от всички автори и теми' },
    { id: 'author', label: 'Тест по автор', desc: 'Избери автор и учи само него' },
    { id: 'work', label: 'Тест по произведение', desc: 'Избери конкретно произведение' },
    { id: 'category', label: 'Тест по категория', desc: 'Фокусирай се върху определена тема' },
    { id: 'difficulty', label: 'Тест по трудност', desc: 'Избери ниво на трудност' },
    { id: 'thesisPractice', label: 'Избери теза', desc: 'Упражнявай подходящи тези за съчинение' },
  ];
  return (
    <div className="mode-grid">
      {modes.map(m => (
        <button key={m.id} className="mode-card" onClick={() => onSelect(m.id)}>
          <span className="mode-card-label">{m.label}</span>
          <span className="mode-card-desc">{m.desc}</span>
        </button>
      ))}
    </div>
  );
}

function PracticePanel({ onSelect, wrongCount, onClearWrong, weakSpotsActive, dailyCompletedToday, dailyStreak }) {
  return (
    <>
      <div className="mode-grid">
        <button className="mode-card mode-card-daily" onClick={() => onSelect('dailyPractice')}>
          <span className="mode-card-label">Дневна тренировка</span>
          <span className="mode-card-desc">
            {dailyCompletedToday ? 'Днес е завършена' : 'Кратък балансиран тест за днес'}
          </span>
          {dailyStreak >= 1 && (
            <span className="daily-streak-note">
              Серия: {dailyStreak} {dailyStreak === 1 ? 'ден' : 'дни'}
            </span>
          )}
        </button>

        <button
          className={`mode-card${weakSpotsActive ? ' mode-card-weakspots' : ''}`}
          onClick={() => onSelect('weakSpots')}
        >
          <span className="mode-card-label">Слаби места</span>
          <span className="mode-card-desc">
            {weakSpotsActive
              ? 'Упражнявай въпросите, които те затрудняват'
              : 'Няма открити слаби места'}
          </span>
        </button>

        <button
          className={`mode-card mode-card-wrong${wrongCount === 0 ? ' mode-card-empty' : ''}`}
          onClick={() => onSelect('wrong')}
        >
          <span className="mode-card-label">
            Преговор на грешните
            {wrongCount > 0 && <span className="wrong-badge">{wrongCount}</span>}
          </span>
          <span className="mode-card-desc">
            {wrongCount > 0 ? `${wrongCount} грешни въпроса` : 'Все още няма грешни въпроси'}
          </span>
        </button>
      </div>

      {wrongCount > 0 && (
        <div className="wrong-actions">
          <button className="btn-clear-wrong" onClick={onClearWrong}>
            Изчисти грешните
          </button>
        </div>
      )}
    </>
  );
}

function CardsPanel({ onSelect }) {
  return (
    <div className="mode-grid">
      <button className="mode-card" onClick={() => onSelect('flashcards')}>
        <span className="mode-card-label">Флашкарти</span>
        <span className="mode-card-desc">Преговаряй автори, произведения, жанрове и композиция</span>
      </button>
      <button className="mode-card" onClick={() => onSelect('studyGuide')}>
        <span className="mode-card-label">Падна ми се автор/произведение</span>
        <span className="mode-card-desc">Бърз справочник за автор или произведение</span>
      </button>
    </div>
  );
}

function StatsPanel({ onViewStats }) {
  return (
    <div className="home-nav-stats-panel">
      <p className="home-nav-stats-desc">
        Пълната статистика включва история на опитите, разбивка по категория и трудност,
        и списък на най-слабите автори и произведения с директни бутони за тест.
      </p>
      <button className="btn-primary" onClick={onViewStats}>
        Виж статистика →
      </button>
    </div>
  );
}

const THEME_OPTIONS = [
  { value: 'system', label: 'Системна' },
  { value: 'dark',   label: 'Тъмна' },
  { value: 'light',  label: 'Светла' },
];

function SettingsPanel({ theme, onSetTheme }) {
  return (
    <div className="settings-panel">
      <p className="settings-section-title">Тема</p>
      <p className="settings-section-desc">
        Избери как да изглежда приложението.
      </p>
      <div className="theme-options">
        {THEME_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`theme-option-btn${theme === opt.value ? ' theme-option-active' : ''}`}
            onClick={() => onSetTheme(opt.value)}
            aria-pressed={theme === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <p className="settings-hint">
        Системната тема следва настройките на устройството.
      </p>
    </div>
  );
}

function HelpPanel() {
  return (
    <div className="help-body help-body-tab">

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
          След всеки завършен тест статистиката се обновява автоматично. От раздел „Статистика"
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
  );
}
