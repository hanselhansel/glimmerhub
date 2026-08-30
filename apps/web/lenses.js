const GLIMMER_TAXONOMY = [
  { id: 'ai-agent', label: 'AI agents', aliases: ['ai agent', 'agentic', 'agent workflow'] },
  { id: 'ai-infrastructure', label: 'AI infrastructure', aliases: ['ai infrastructure', 'llm infrastructure', 'inference'] },
  { id: 'robotics', label: 'Robotics', aliases: ['robot', 'robotics', 'humanoid'] },
  { id: 'embodied-ai', label: 'Embodied AI', aliases: ['embodied ai', 'embodied', 'vision-language-action', 'vla'] },
  { id: 'robot-learning', label: 'Robot learning', aliases: ['robot learning', 'imitation learning', 'policy learning'] },
  { id: 'simulation', label: 'Simulation', aliases: ['simulation', 'simulator', 'sim-to-real', 'mujoco'] },
  { id: 'world-models', label: 'World models', aliases: ['world model', 'world models'] },
  { id: 'sensor-fusion', label: 'Sensor fusion', aliases: ['sensor fusion', 'sensors', 'perception'] },
  { id: 'edge-inference', label: 'Edge inference', aliases: ['edge inference', 'on-device', 'embedded ai'] },
  { id: 'self-hosted', label: 'Self-hosted', aliases: ['self-hosted', 'local-first', 'on-premise'] },
  { id: 'developer-tools', label: 'Developer tools', aliases: ['developer tools', 'coding assistant', 'cli'] }
];

const GLIMMER_LENSES = [
  {
    id: 'general',
    name: 'General',
    description: 'The strongest open-source movements across every tracked topic.',
    themes: [],
    exampleEntityIds: [],
    exclusions: [],
    editorial: {
      leadEntityId: 'deepseek-ai/deepseek-harness',
      patternTitle: 'Agent infrastructure is replacing agent demos.',
      patternSummary: 'This week, control layers, evaluation harnesses, and repeatable workflows are gaining more credible momentum than one-off demos.'
    },
    builtIn: true
  },
  {
    id: 'physical-ai',
    name: 'Physical AI',
    description: 'Robotics, embodied AI, simulation, world models, sensors, and edge inference.',
    themes: GLIMMER_TAXONOMY.filter(theme => ['robotics', 'embodied-ai', 'robot-learning', 'simulation', 'world-models', 'sensor-fusion', 'edge-inference'].includes(theme.id)).map(theme => ({ ...theme, enabled: true })),
    exampleEntityIds: ['huggingface/lerobot', 'isaac-sim/IsaacLab'],
    exclusions: ['general computer vision'],
    editorial: {
      leadEntityId: 'huggingface/lerobot',
      patternTitle: 'Data bottlenecks are shaping the stack.',
      patternSummary: 'Momentum is shifting toward simulation, teleoperation, and reusable datasets. New robot models are no longer the only signal worth watching.'
    },
    builtIn: true
  }
];
