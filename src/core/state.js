export const state = {
  version: 1,
  treats: 0,
  dust: 0,
  energy: 10,
  clickLevel: 0,
  generators: { toy: 0, bowl: 0 },
  ownedSkins: ["default"],
  equippedSkin: "default",
  lastSeen: Date.now(),
  energyUpdatedAt: Date.now(),
  pendingReward: null,
};
