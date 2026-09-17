const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('disciplines.json', 'utf8'));

// Sample hardcoded ones from the plan
const predefined = {
  "OBBGSIN.085": {
    "type": "mixed",
    "difficulty": 2,
    "skills": ["Lógica de programação", "Depuração de código", "Pensamento algorítmico", "Abstração de problemas"],
    "tools": ["Python", "VisualG", "VS Code"],
    "activities": ["Desenvolvimento de algoritmos", "Implementação de programas em linguagem de alto nível", "Resolução de exercícios práticos"],
    "dependencies": [],
    "tags": ["programação", "algoritmos", "iniciante"]
  },
  "OBBGSIN.010": {
    "type": "mixed",
    "difficulty": 3,
    "skills": ["Abstração", "Encapsulamento", "Herança", "Polimorfismo", "Modelagem OO"],
    "tools": ["Java", "IntelliJ IDEA", "UML"],
    "activities": ["Modelagem de classes", "Implementação de herança e polimorfismo", "Tratamento de exceções"],
    "dependencies": ["OBBGSIN.085"],
    "tags": ["oop", "java", "programação"]
  },
  "OBBGSIN.016": {
    "type": "mixed",
    "difficulty": 3,
    "skills": ["Modelagem relacional", "SQL", "Normalização", "Design de esquemas"],
    "tools": ["MySQL", "PostgreSQL", "MySQL Workbench", "brModelo"],
    "activities": ["Modelagem ER", "Consultas SQL complexas", "Normalização de tabelas", "Integração com linguagem de programação"],
    "dependencies": ["OBBGSIN.085"],
    "tags": ["banco de dados", "sql", "modelagem"]
  },
  "OBBGSIN.023": {
    "type": "practical",
    "difficulty": 3,
    "skills": ["HTML/CSS", "JavaScript", "Desenvolvimento responsivo", "Requisições HTTP", "Arquitetura cliente-servidor"],
    "tools": ["VS Code", "Node.js", "PHP", "MySQL", "Git"],
    "activities": ["Criação de páginas web", "Desenvolvimento de APIs", "Manipulação do DOM", "Integração com banco de dados"],
    "dependencies": ["OBBGSIN.085", "OBBGSIN.010"],
    "tags": ["web", "front-end", "back-end", "javascript"]
  },
  "OBBGSIN.034": {
    "type": "mixed",
    "difficulty": 4,
    "skills": ["Machine Learning", "Busca heurística", "Redes neurais", "Representação do conhecimento"],
    "tools": ["Python", "scikit-learn", "TensorFlow", "Jupyter Notebook"],
    "activities": ["Implementação de algoritmos de busca", "Treinamento de modelos ML", "Projetos com redes neurais"],
    "dependencies": ["OBBGSIN.085", "OBBGSIN.031", "OBBGSIN.021"],
    "tags": ["IA", "machine learning", "redes neurais"]
  }
};

const enriched = raw.map(d => {
  if (predefined[d.id]) {
    return { ...d, ...predefined[d.id] };
  }
  
  // Heuristics for others
  let type = "theoretical";
  if (d.practice_hours > 0 && d.theory_hours > 0) type = "mixed";
  if (d.practice_hours > 0 && d.theory_hours === 0) type = "practical";
  
  let difficulty = 3;
  if (d.semester > 5 || d.name.includes('Avançados') || d.name.includes('Cálculo')) difficulty = 4;
  if (d.semester <= 2) difficulty = 2;
  
  const tags = [];
  const nameStr = d.name.toLowerCase();
  const descStr = (d.description || '').toLowerCase();
  
  if (nameStr.includes('gestão') || nameStr.includes('administração')) tags.push("gestão");
  if (descStr.includes('programação') || nameStr.includes('programação')) tags.push("programação");
  if (nameStr.includes('matemática') || nameStr.includes('cálculo') || nameStr.includes('álgebra')) tags.push("matemática");
  
  return {
    ...d,
    type,
    difficulty,
    skills: ["Habilidade geral em " + d.name],
    tools: ["Ferramentas da disciplina"],
    activities: ["Aulas teóricas e práticas conforme ementa"],
    dependencies: [],
    tags: tags.length ? tags : ["geral"]
  };
});

fs.mkdirSync('public/data', { recursive: true });
fs.writeFileSync('public/data/disciplines.json', JSON.stringify(enriched, null, 2));
console.log('Enriched disciplines.json created in public/data');
