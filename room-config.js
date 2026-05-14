window.MR_ROOM_CONFIG = {
  textures: {
    front: "assets/cube/wall-wood-front.png",
    back: "assets/cube/wall-wood-back.png",
    left: "assets/cube/wall-wood-left.png",
    right: "assets/cube/wall-wood-right.png",
    ceiling: "assets/cube/ceiling.png",
    floor: "assets/cube/floor.png"
  },

  roles: [
    {
      id: "ai-coach",
      name: "AI 书法教练",
      type: "coach",
      color: "#39b88f",
      position: [-2.7, -3.02, -5.2],
      scale: 1.08,
      view: { yaw: -28, pitch: -6, scale: 1.05 },
      description: "负责讲解结构评分、笔画拆解和实时改进建议。"
    },
    {
      id: "learner",
      name: "练习者",
      type: "student",
      color: "#d94a3a",
      position: [2.65, -3.02, -3.25],
      scale: 0.96,
      view: { yaw: 34, pitch: -10, scale: 1.12 },
      description: "站在书案前完成临摹、创作和复盘操作。"
    },
    {
      id: "observer",
      name: "观摩同学",
      type: "guest",
      color: "#4a8fd8",
      position: [5.4, -3.02, -1.6],
      scale: 0.9,
      view: { yaw: 58, pitch: -8, scale: 1.1 },
      description: "用于模拟多人协同观摩、讨论和成果分享。"
    }
  ]
};
