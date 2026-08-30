GLIMMER_DATA.entities.push(
  {
    id: 'huggingface/lerobot', owner: 'huggingface', name: 'lerobot', kind: 'repository',
    description: 'State-of-the-art machine learning for real-world robotics in PyTorch.',
    url: 'https://github.com/huggingface/lerobot', stars: 17200, starsGainedWeek: 1842, starsGainedMonth: 4200,
    language: 'Python', license: 'Apache-2.0',
    topics: ['Robotics', 'Embodied AI', 'Robot learning'], momentum: 'rising', status: 'Prototype data',
    sources: [
      { name: 'GitHub', url: 'https://github.com/huggingface/lerobot' },
      { name: 'Releases', url: 'https://github.com/huggingface/lerobot/releases' }
    ],
    briefing: {
      editorialHeadline: 'LeRobot is becoming the default open stack for robot learning.',
      whatItDoes: 'Provides models, datasets, hardware integrations, and training workflows for learning robot policies with PyTorch.',
      whyTrending: 'Hardware integrations, dataset contributions, and imitation-learning recipes are converging in one open ecosystem.',
      recentChanges: [
        { type: 'release', title: 'Hardware and policy updates', summary: 'Expanded robot support and reusable training recipes.', url: 'https://github.com/huggingface/lerobot/releases' }
      ],
      signals: { activity: 88, releaseCadence: 82, contributorGrowth: 90, issueResolution: 72 },
      alternatives: [
        { name: 'NVIDIA Isaac Lab', url: 'https://github.com/isaac-sim/IsaacLab' },
        { name: 'OpenVLA', url: 'https://github.com/openvla/openvla' }
      ],
      risks: ['Fast-moving APIs', 'Hardware support varies by platform']
    },
    mentions: [
      { source: 'GitHub', url: 'https://github.com/huggingface/lerobot', quote: 'Robot-learning models, datasets, and hardware integrations in one toolkit.' },
      { source: 'Releases', url: 'https://github.com/huggingface/lerobot/releases', quote: 'New releases continue to broaden hardware and policy support.' }
    ],
    activity: [420, 580, 760, 1040, 1310, 1590, 1842]
  },
  {
    id: 'NVIDIA/Isaac-GR00T', owner: 'NVIDIA', name: 'Isaac-GR00T', kind: 'repository',
    description: 'An open foundation-model and data stack for generalist robot learning.',
    url: 'https://github.com/NVIDIA/Isaac-GR00T', stars: 9800, starsGainedWeek: 1310, starsGainedMonth: 3600,
    language: 'Python', license: 'Apache-2.0',
    topics: ['Robotics', 'Embodied AI', 'World models'], momentum: 'rising', status: 'Prototype data',
    sources: [{ name: 'GitHub', url: 'https://github.com/NVIDIA/Isaac-GR00T' }],
    briefing: {
      editorialHeadline: 'GR00T is turning foundation-model research into reproducible robot workflows.',
      whatItDoes: 'Packages robot foundation models, data tooling, and workflows for adapting policies to new embodiments.',
      whyTrending: 'Interest is moving from closed humanoid demos toward code and checkpoints teams can inspect and adapt.',
      recentChanges: [{ type: 'commit', title: 'Workflow expansion', summary: 'Added training and adaptation paths for more robot configurations.', url: 'https://github.com/NVIDIA/Isaac-GR00T/commits/main' }],
      signals: { activity: 84, releaseCadence: 70, contributorGrowth: 82, issueResolution: 68 },
      alternatives: [{ name: 'LeRobot', url: 'https://github.com/huggingface/lerobot' }],
      risks: ['Large compute requirements', 'Young integration surface']
    },
    mentions: [{ source: 'GitHub', url: 'https://github.com/NVIDIA/Isaac-GR00T', quote: 'A foundation-model stack for generalist robot learning.' }],
    activity: [180, 310, 520, 760, 980, 1160, 1310]
  },
  {
    id: 'isaac-sim/IsaacLab', owner: 'isaac-sim', name: 'IsaacLab', kind: 'repository',
    description: 'A unified framework for robot learning built on NVIDIA Isaac Sim.',
    url: 'https://github.com/isaac-sim/IsaacLab', stars: 6900, starsGainedWeek: 742, starsGainedMonth: 1900,
    language: 'Python', license: 'BSD-3-Clause',
    topics: ['Robotics', 'Simulation', 'Robot learning'], momentum: 'rising', status: 'Prototype data',
    sources: [{ name: 'GitHub', url: 'https://github.com/isaac-sim/IsaacLab' }],
    briefing: {
      editorialHeadline: 'Isaac Lab is gaining as simulation becomes the cheapest source of robot experience.',
      whatItDoes: 'Offers modular simulation environments, task definitions, sensors, and reinforcement-learning workflows.',
      whyTrending: 'Teams need more data than real robots can produce. Simulation tooling is becoming a core part of the model stack.',
      recentChanges: [{ type: 'release', title: 'Simulation workflow update', summary: 'Expanded environments and training examples.', url: 'https://github.com/isaac-sim/IsaacLab/releases' }],
      signals: { activity: 78, releaseCadence: 80, contributorGrowth: 74, issueResolution: 76 },
      alternatives: [{ name: 'MuJoCo', url: 'https://github.com/google-deepmind/mujoco' }],
      risks: ['Tied to the Isaac Sim ecosystem', 'High local hardware requirements']
    },
    mentions: [{ source: 'GitHub', url: 'https://github.com/isaac-sim/IsaacLab', quote: 'Simulation environments and training workflows for robot learning.' }],
    activity: [120, 190, 280, 390, 520, 640, 742]
  },
  {
    id: 'openvla/openvla', owner: 'openvla', name: 'openvla', kind: 'repository',
    description: 'An open vision-language-action model for robot manipulation.',
    url: 'https://github.com/openvla/openvla', stars: 5200, starsGainedWeek: 684, starsGainedMonth: 1500,
    language: 'Python', license: 'MIT',
    topics: ['Embodied AI', 'Robot learning', 'Edge inference'], momentum: 'rising', status: 'Prototype data',
    sources: [{ name: 'GitHub', url: 'https://github.com/openvla/openvla' }],
    briefing: {
      editorialHeadline: 'Smaller vision-language-action models are lowering the cost of lab deployment.',
      whatItDoes: 'Maps visual observations and language instructions to robot actions with open model weights and training code.',
      whyTrending: 'Open VLA models give research teams a practical path to test embodied models without a closed robotics stack.',
      recentChanges: [{ type: 'commit', title: 'Model and evaluation updates', summary: 'Refined evaluation and deployment instructions.', url: 'https://github.com/openvla/openvla/commits/main' }],
      signals: { activity: 75, releaseCadence: 62, contributorGrowth: 70, issueResolution: 64 },
      alternatives: [{ name: 'LeRobot', url: 'https://github.com/huggingface/lerobot' }],
      risks: ['Research-grade deployment path', 'Results depend on target hardware and data']
    },
    mentions: [{ source: 'GitHub', url: 'https://github.com/openvla/openvla', quote: 'Open weights and training code for a vision-language-action model.' }],
    activity: [90, 150, 240, 350, 470, 590, 684]
  },
  {
    id: 'google-deepmind/mujoco', owner: 'google-deepmind', name: 'mujoco', kind: 'repository',
    description: 'A fast physics engine for model-based control and robotics simulation.',
    url: 'https://github.com/google-deepmind/mujoco', stars: 9200, starsGainedWeek: 411, starsGainedMonth: 980,
    language: 'C++', license: 'Apache-2.0',
    topics: ['Robotics', 'Simulation'], momentum: 'steady', status: 'Prototype data',
    sources: [{ name: 'GitHub', url: 'https://github.com/google-deepmind/mujoco' }],
    briefing: {
      editorialHeadline: 'MuJoCo is rising again as robot teams search for cheaper data.',
      whatItDoes: 'Simulates articulated systems and contact-rich dynamics for robotics, control, and reinforcement learning.',
      whyTrending: 'New robot models increase demand for reliable simulation, evaluation, and synthetic experience.',
      recentChanges: [{ type: 'release', title: 'Engine update', summary: 'Continued physics, rendering, and platform improvements.', url: 'https://github.com/google-deepmind/mujoco/releases' }],
      signals: { activity: 70, releaseCadence: 74, contributorGrowth: 58, issueResolution: 84 },
      alternatives: [{ name: 'Isaac Lab', url: 'https://github.com/isaac-sim/IsaacLab' }],
      risks: ['Physics fidelity still requires careful task validation']
    },
    mentions: [{ source: 'GitHub', url: 'https://github.com/google-deepmind/mujoco', quote: 'A mature physics engine at the center of many robot-learning workflows.' }],
    activity: [52, 88, 130, 190, 260, 340, 411]
  }
);