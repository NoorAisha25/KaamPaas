import { SKILLS } from "../constants";
import { useLanguage } from "../context/LanguageContext";
import Icon from "./Icon";

export default function SkillPicker({ selected, onChange, multi = false }) {
  const { t } = useLanguage();

  const toggle = (skillId) => {
    if (multi) {
      const isSelected = selected.includes(skillId);
      onChange(isSelected ? selected.filter((s) => s !== skillId) : [...selected, skillId]);
    } else {
      onChange(skillId);
    }
  };

  const isSelected = (skillId) => (multi ? selected.includes(skillId) : selected === skillId);

  return (
    <div className="skill-grid">
      {SKILLS.map((skill) => (
        <div
          key={skill.id}
          className={`skill-chip ${isSelected(skill.id) ? "selected" : ""}`}
          onClick={() => toggle(skill.id)}
        >
          <Icon
            name={skill.icon}
            size={24}
            style={{ margin: "0 auto 8px", color: isSelected(skill.id) ? "var(--KaamPaas-orange)" : "var(--text-dark)" }}
          />
          {t(`skill_${skill.id}`)}
        </div>
      ))}
    </div>
  );
}

