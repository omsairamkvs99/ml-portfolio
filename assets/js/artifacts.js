/*
  Artifact registry for the homepage.
  Each week: add one object to this list and drop the new artifact
  in its own folder under /artifacts/. The homepage builds itself from this file.
  status: "live" shows a View button, "upcoming" shows a placeholder card.
*/
const ARTIFACTS = [
  {
    number: "01",
    week: "Week 1",
    category: "Machine Learning Foundations",
    title: "ML Algorithm Framework: Twelve Algorithms, Four Domains",
    summary:
      "An interactive visual framework that classifies twelve machine learning algorithms by learning style and application domain, maps how they connect, and ties several of them to problems I deal with in automotive technical support.",
    tools: ["HTML", "CSS", "JavaScript", "GitHub Pages"],
    link: "artifacts/01-ml-algorithm-framework/",
    status: "live"
  },
  {
    number: "02",
    week: "Week 2",
    category: "Deep Learning Foundations",
    title: "Inside a Neural Network: An Interactive Slide Deck",
    summary:
      "A 13 slide interactive deck that explains layers, neurons, weights, activation functions, loss functions, and optimization, with an animated network diagram and results from my own TensorFlow Playground training runs.",
    tools: ["HTML", "CSS", "JavaScript", "SVG", "TensorFlow Playground"],
    link: "artifacts/02-neural-network-components/",
    status: "live"
  }
];
