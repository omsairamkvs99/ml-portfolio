/*
  Content for the ML Algorithm Framework.
  domains: 2 = primary domain, 1 = secondary domain (used, but not the main home)
  learning: "supervised" | "unsupervised" | "selfsupervised"
  Self supervised models are grouped under the unsupervised branch because they
  learn from unlabeled data; the page explains that decision.
*/

const DOMAINS = {
  tab: { label: "Tabular Data", short: "Tabular" },
  cv:  { label: "Computer Vision", short: "Vision" },
  nlp: { label: "Natural Language Processing", short: "NLP" },
  gen: { label: "Generative AI", short: "GenAI" }
};

const LEARNING = {
  supervised: {
    label: "Supervised",
    note: "Learns from labeled examples, where every input comes with the answer."
  },
  unsupervised: {
    label: "Unsupervised",
    note: "Learns from unlabeled data by finding structure or modeling the data itself."
  },
  selfsupervised: {
    label: "Unsupervised (self supervised)",
    note: "Builds its own training targets out of unlabeled data, such as the next word or the noise that was added."
  }
};

/* tree groups, in display order */
const GROUPS = [
  { branch: "supervised",   name: "Classical and ensemble models", ids: ["logreg", "svm", "rf", "xgb"] },
  { branch: "supervised",   name: "Deep learning models",          ids: ["cnn", "lstm"] },
  { branch: "unsupervised", name: "Structure discovery",           ids: ["kmeans", "pca"] },
  { branch: "unsupervised", name: "Generative models",             ids: ["gan", "vae"] },
  { branch: "unsupervised", name: "Self supervised foundation models", ids: ["transformer", "diffusion"] }
];

const ALGORITHMS = [
  {
    id: "logreg",
    name: "Logistic Regression",
    family: "Classical ML",
    learning: "supervised",
    task: "Classification",
    domains: { tab: 2, nlp: 1 },
    how: "Takes a weighted sum of the input features and passes it through a sigmoid curve, which turns the result into a probability between 0 and 1. Training adjusts the weights to minimize log loss, so the model gets more confident on correct answers and penalized for confident wrong ones.",
    uses: [
      "Predicting whether a loan applicant will default",
      "Customer churn scoring for subscription businesses",
      "Simple spam filters built on bag of words features"
    ],
    work: null,
    related: ["svm", "xgb"]
  },
  {
    id: "svm",
    name: "Support Vector Machine",
    family: "Classical ML",
    learning: "supervised",
    task: "Classification",
    domains: { tab: 2, nlp: 1, cv: 1 },
    how: "Searches for the boundary that separates two classes with the widest possible margin. Only the points closest to the boundary (the support vectors) decide where it goes. The kernel trick lets it draw curved boundaries by implicitly mapping data into a higher dimensional space.",
    uses: [
      "Text and sentiment classification on high dimensional word features",
      "Classic pedestrian detection using HOG image features",
      "Protein and gene classification in bioinformatics"
    ],
    work: null,
    related: ["logreg"]
  },
  {
    id: "rf",
    name: "Random Forest",
    family: "Ensemble (bagging)",
    learning: "supervised",
    task: "Classification and regression",
    domains: { tab: 2 },
    how: "Trains hundreds of decision trees, each on a random sample of the rows and a random subset of the features, then lets them vote (or averages them for regression). Because the trees make different mistakes, the combined answer is more stable than any single tree.",
    uses: [
      "Credit card fraud detection",
      "Predicting equipment failure from maintenance logs",
      "Ranking which features matter most in a dataset"
    ],
    work: null,
    related: ["xgb", "kmeans"]
  },
  {
    id: "xgb",
    name: "XGBoost (Gradient Boosting)",
    family: "Ensemble (boosting)",
    learning: "supervised",
    task: "Classification and regression",
    domains: { tab: 2 },
    how: "Builds trees one after another instead of in parallel. Each new tree is fit to the errors (the gradient of the loss) left by the trees before it, and built in regularization keeps the trees from overfitting. It is still one of the strongest choices for structured, spreadsheet style data.",
    uses: [
      "Retail demand forecasting at the store and product level",
      "Insurance and credit risk scoring",
      "Click through rate prediction for online ads"
    ],
    work: "I am moving into a data engineering role in grocery retail, where demand forecasting on large sales tables is a classic boosting problem. Seeing how much these models depend on clean feature pipelines changed how I think about the data engineering side.",
    related: ["rf", "logreg"]
  },
  {
    id: "cnn",
    name: "Convolutional Neural Network",
    family: "Deep learning",
    learning: "supervised",
    task: "Image classification and detection",
    domains: { cv: 2, gen: 1 },
    how: "Slides small learned filters across an image to detect local patterns. Early layers pick up edges and corners, deeper layers combine them into shapes and objects, and pooling layers shrink the image so the network focuses on what is present rather than exactly where it is.",
    uses: [
      "Lane and object detection in driver assistance cameras",
      "Spotting tumors in medical scans",
      "Surface defect inspection on manufacturing lines"
    ],
    work: "At Ford GTAC I troubleshoot camera and sensor calibration issues. Vision models in driver assistance features are trained on images from a camera mounted at an exact angle, so even a small calibration error shifts what the CNN sees and can degrade detection. That is a big part of why calibration procedures are so strict.",
    related: ["gan", "diffusion"]
  },
  {
    id: "lstm",
    name: "RNN / LSTM",
    family: "Deep learning",
    learning: "supervised",
    task: "Sequence modeling",
    domains: { nlp: 2, tab: 1 },
    how: "Processes a sequence one step at a time and carries a hidden state forward, so earlier inputs influence later outputs. The LSTM version adds gates that decide what to remember and what to forget, which fixes the plain RNN's habit of losing information over long sequences.",
    uses: [
      "Speech recognition and earlier machine translation systems",
      "Forecasting from sensor and time series data",
      "Next word prediction on phone keyboards"
    ],
    work: null,
    related: ["transformer"]
  },
  {
    id: "kmeans",
    name: "K Means Clustering",
    family: "Classical ML",
    learning: "unsupervised",
    task: "Clustering",
    domains: { tab: 2, cv: 1 },
    how: "Picks K starting centers, assigns every point to its nearest center, moves each center to the average of its assigned points, and repeats until nothing changes. The result is K groups of similar records, with no labels needed.",
    uses: [
      "Customer segmentation for targeted marketing",
      "Color quantization and simple image segmentation",
      "Grouping documents or tickets with similar content"
    ],
    work: "A lot of my work involves root cause analysis on Jira tickets. Clustering ticket descriptions (after turning the text into vectors) is a practical way to surface recurring issue groups that would be easy to miss when reading tickets one at a time.",
    related: ["pca"]
  },
  {
    id: "pca",
    name: "Principal Component Analysis",
    family: "Classical ML",
    learning: "unsupervised",
    task: "Dimensionality reduction",
    domains: { tab: 2, cv: 1 },
    how: "Finds the directions in the data where the variance is largest, then projects the data onto the top few of those directions. You keep most of the information with far fewer columns, which helps with visualization, speed, and noise reduction.",
    uses: [
      "Compressing hundreds of sensor readings into a few components",
      "Eigenfaces, an early approach to face recognition",
      "Preprocessing before clustering or plotting high dimensional data"
    ],
    work: null,
    related: ["kmeans", "vae"]
  },
  {
    id: "gan",
    name: "Generative Adversarial Network",
    family: "Deep generative",
    learning: "unsupervised",
    task: "Data generation",
    domains: { gen: 2, cv: 2 },
    how: "Two networks compete. The generator turns random noise into fake samples, and the discriminator tries to tell fake from real. As each one improves, the generator is pushed to produce samples realistic enough to fool the discriminator. No human labels are involved; the real versus fake signal comes from the setup itself.",
    uses: [
      "Generating realistic faces and artwork",
      "Image super resolution and photo restoration",
      "Synthetic training images for rare defect or edge case scenarios"
    ],
    work: null,
    related: ["vae", "diffusion", "cnn"]
  },
  {
    id: "vae",
    name: "Variational Autoencoder",
    family: "Deep generative",
    learning: "unsupervised",
    task: "Representation learning and generation",
    domains: { gen: 2, cv: 1, tab: 1 },
    how: "An encoder compresses each input into a probability distribution in a small latent space, and a decoder rebuilds the input from a sample of that distribution. Training balances reconstruction accuracy against keeping the latent space smooth, so new points sampled from it decode into new, plausible data.",
    uses: [
      "Anomaly detection, where poorly reconstructed inputs are flagged",
      "Generating new molecules in drug discovery",
      "The compression stage inside latent diffusion image generators"
    ],
    work: "VAE style anomaly detection maps well to vehicle sensor data. A model trained on normal readings reconstructs them well and struggles with unusual ones, which gives a way to flag possible faults without needing a labeled example of every failure.",
    related: ["pca", "diffusion", "gan"]
  },
  {
    id: "transformer",
    name: "Transformer (BERT, GPT)",
    family: "Deep learning",
    learning: "selfsupervised",
    task: "Language understanding and generation",
    domains: { nlp: 2, gen: 2, cv: 1 },
    how: "Uses self attention, where every token in a sequence looks at every other token and weighs how relevant each one is. Because it processes the whole sequence in parallel, it trains much faster than an RNN. Models like GPT are pretrained on huge amounts of unlabeled text by predicting the next token, then often fine tuned with supervised data.",
    uses: [
      "Chat assistants and large language models",
      "Search ranking, summarization, and translation",
      "Vision Transformers for image classification"
    ],
    work: "I develop AI bots on Ford's internal LLM platform, and the models behind them are transformer based. Knowing that they are pretrained without labels and then adapted explains both what they do well and why grounding them in our own documentation matters.",
    related: ["lstm", "diffusion"]
  },
  {
    id: "diffusion",
    name: "Diffusion Models",
    family: "Deep generative",
    learning: "selfsupervised",
    task: "Data generation",
    domains: { gen: 2, cv: 2 },
    how: "During training, noise is added to images step by step and a network learns to predict that noise. To generate, the model starts from pure noise and removes it a little at a time until an image appears. Text to image systems steer this process with a text encoder, and latent diffusion runs it inside a VAE's compressed space to save compute.",
    uses: [
      "Text to image tools such as Stable Diffusion",
      "Image editing, inpainting, and upscaling",
      "Synthetic data for training perception models"
    ],
    work: null,
    related: ["vae", "gan", "transformer"]
  }
];

/* relationship threads for the "How they connect" section */
const THREADS = [
  {
    title: "Tree ensembles",
    steps: [
      { id: "rf", edge: "many trees in parallel, then vote" },
      { id: "xgb", edge: "trees in sequence, each fixing the last" }
    ],
    lead: "Decision tree",
    note: "Both start from the same building block. Random Forest reduces variance by averaging independent trees; boosting reduces bias by correcting errors one tree at a time."
  },
  {
    title: "Drawing a boundary",
    steps: [
      { id: "logreg", edge: "" },
      { id: "svm", edge: "widest margin, curved with kernels" }
    ],
    note: "Both separate classes with a boundary. Logistic Regression gives probabilities, while SVM focuses only on the hardest points near the line."
  },
  {
    title: "Compression to generation",
    steps: [
      { id: "pca", edge: "" },
      { id: "vae", edge: "nonlinear and probabilistic" },
      { id: "diffusion", edge: "denoises inside the VAE latent space" }
    ],
    note: "Each step compresses data into a smaller representation. PCA does it linearly, a VAE learns it with neural networks and can sample from it, and latent diffusion builds on that compressed space."
  },
  {
    title: "Reading sequences",
    steps: [
      { id: "lstm", edge: "" },
      { id: "transformer", edge: "attention replaces recurrence" }
    ],
    note: "LSTMs read one token at a time. Transformers look at the whole sequence at once, which is why they scaled into today's language models."
  },
  {
    title: "Three ways to generate",
    steps: [
      { id: "gan", edge: "" },
      { id: "vae", edge: "" },
      { id: "diffusion", edge: "" }
    ],
    parallel: true,
    note: "GANs learn through competition, VAEs through reconstruction, and diffusion through denoising. Diffusion has largely replaced GANs for image quality because it trains more stably."
  },
  {
    title: "Shared building blocks",
    steps: [
      { id: "cnn", edge: "" },
      { id: "gan", edge: "convolution layers in both networks" },
      { id: "diffusion", edge: "convolution based denoiser, steered by a transformer text encoder" }
    ],
    note: "Generative models are not built from scratch. They reuse CNN layers for images and transformer encoders for text prompts."
  },
  {
    title: "Reduce, then group",
    steps: [
      { id: "pca", edge: "" },
      { id: "kmeans", edge: "cluster on the top components" }
    ],
    note: "Running PCA first removes noise and makes distances more meaningful, which usually gives cleaner clusters."
  }
];
