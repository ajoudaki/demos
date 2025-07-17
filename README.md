# Neural Network Demos

An interactive collection of web-based demonstrations exploring neural network theory, continual learning, and visualization techniques. Built with modern web technologies for educational and research purposes.

## 🎯 Overview

This repository hosts a suite of interactive demos that visualize fundamental concepts in neural network theory, with a special focus on continual learning and the catastrophic forgetting phenomenon. Each demo is designed to be intuitive, educational, and runs entirely in your browser.

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ajoudaki/demos.git
cd demos

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run preview  # Preview the production build
```

## 📚 Available Demos

### Core Demonstrations

#### 1. **Unified Continual Learning Demo**
The flagship demo showcasing neural network training with task switching capabilities. Features:
- Real-time network training visualization
- Multiple 2D classification tasks (XOR, Spiral, Circle, Ring, Gaussian)
- Catastrophic forgetting demonstration
- Model history and timeline navigation
- Interactive activation heatmaps

#### 2. **Model History Demo**
Explore how neural networks evolve during training:
- Timeline-based model snapshots
- Compare network states across different training phases
- Visualize weight and activation changes over time

#### 3. **Integrated Training Demos**
Simplified training interfaces for quick experimentation:
- `IntegratedTrainingDemo` - Full-featured training environment
- `IntegratedTrainingDemoSimple` - Streamlined version for beginners

### Component Showcases

Individual component demonstrations for deeper exploration:

- **Network Visualization** - Interactive neural network architecture diagrams
- **Activation Heatmaps** - Visualize neuron activations across input space
- **Loss Charts** - Real-time training and test loss curves
- **Data Generation** - Explore different 2D classification datasets
- **Training Controls** - Experiment with hyperparameters

## 🛠️ Technology Stack

- **Frontend**: React 18 with React Router
- **Visualization**: D3.js for interactive graphics
- **Build Tool**: Vite for fast development and optimized builds
- **Neural Network**: Custom JavaScript implementation with configurable architecture

## 🏗️ Project Structure

```
demos/
├── src/
│   ├── demos/              # All demo components
│   ├── components/         # Reusable UI components
│   ├── neural-network/     # Core neural network implementation
│   └── utils/              # Utility functions (data generation, etc.)
├── public/                 # Static assets
└── package.json           # Project configuration
```

## 🎨 Key Features

### Neural Network Capabilities
- **Configurable Architecture**: Adjust hidden layers and neurons per layer
- **Multiple Activations**: Support for tanh, sigmoid, and ReLU
- **Flexible Training**: Adjustable learning rate, batch size, and epochs
- **Real-time Visualization**: See the network learn in real-time

### Visualization Features
- **Interactive Network Diagrams**: Click and explore network connections
- **Activation Heatmaps**: Understand how neurons respond to different inputs
- **Decision Boundaries**: Visualize classification regions in 2D space
- **Training Metrics**: Monitor loss curves and accuracy in real-time

### Educational Focus
- **Catastrophic Forgetting**: Demonstrate how neural networks forget previous tasks
- **Continual Learning**: Explore strategies for learning multiple tasks sequentially
- **Interactive Experimentation**: Hands-on learning with immediate visual feedback

## 🤝 Contributing

Contributions are welcome! Whether you're fixing bugs, adding new demos, or improving documentation:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📖 Future Directions

- Additional neural network architectures (CNNs, RNNs)
- More complex datasets and tasks
- Advanced continual learning algorithms
- 3D visualizations
- Performance optimizations for larger networks

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

Built with passion for making neural network concepts accessible and interactive. Special thanks to the open-source community for the amazing tools that made this project possible.

---

**Live Demo**: Coming soon!

**Questions or Feedback?** Open an issue or reach out through GitHub.