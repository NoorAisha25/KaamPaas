import { SKILLS } from "../constants";
import { useLanguage } from "../context/LanguageContext";
import Icon from "./Icon";

export default function SkillPillBar({ selected, onChange }) {
  const { t } = useLanguage();

  return (
    <div className="skill-pills">
      <button
        className={`skill-pill ${selected === "all" ? "active" : ""}`}
        onClick={() => onChange("all")}
      >
        All
      </button>
      {SKILLS.map((skill) => (
        <button
          key={skill.id}
          className={`skill-pill icon-btn ${selected === skill.id ? "active" : ""}`}
          onClick={() => onChange(skill.id)}
        >
          <Icon name={skill.icon} size={16} />
          {t(`skill_${skill.id}`)}
        </button>
      ))}
    </div>
  );
}

