export const calculateXpBonus = (user, mission, dbData) => {
  let totalBonusPercent = 0;

  const userSkill = user.skills.find(s => s.skillId === mission.skill_id);
  if (userSkill) {
    const relevantPerks = dbData.skillPerks.filter(
      p => p.skillId === mission.skill_id && 
           userSkill.rank >= p.requiredRank &&
           p.effectType === 'xp_percent'
    );
    
    relevantPerks.forEach(p => {
      totalBonusPercent += p.value;
    });
  }

  const equippedItemIds = Object.values(user.equippedSlots || {});
  
  equippedItemIds.forEach(itemId => {
    const item = dbData.items.find(i => i.id === itemId);
    if (item && item.effects) {
      const skillName = dbData.skills.find(s => s.id === mission.skill_id)?.name.toLowerCase();
      const effectName = `${skillName}_exp_bonus`;
      
      const bonusEffect = item.effects.find(e => e.type === effectName);
      if (bonusEffect) {
        totalBonusPercent += bonusEffect.value;
      }
    }
  });

  return totalBonusPercent;
};