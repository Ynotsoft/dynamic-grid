import './styles.css';

export { default as DynamicGrid } from './DynamicGrid/Grid.jsx';

// Default exports for backward compatibility

// Export default as DynamicGrid (main component)
import DynamicGridComponent from './DynamicGrid/Grid.jsx';
export default DynamicGridComponent;

// Also export the component with an alias
export { DynamicGridComponent };