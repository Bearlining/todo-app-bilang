import React, { createContext, useContext, useState, useCallback } from 'react';

// 掉落物品类型定义
interface FallingItem {
  id: number;
  x: number;
  delay: number;
  duration: number;
  rotation: number;
  scale: number;
  type: string;
}

// 根据类别获取对应的掉落物品
const getItemsByCategory = (category: string): string[] => {
  switch (category) {
    case 'work':
      return ['coffee', 'laptop', 'briefcase', 'document', 'pen'];
    case 'health':
      return ['pill', 'heart', 'bandage', 'apple', 'vitamin'];
    case 'life':
      return ['house', 'plant', 'cup', 'book', 'flower'];
    case 'study':
      return ['star', 'lightbulb', 'graduation', 'book', 'pencil'];
    case 'other':
    default:
      return ['snowflake', 'cherry blossom', 'chicken leg', 'cake', 'cookie', 'candy'];
  }
};

// 掉落物品的SVG图标组件
const ItemIcon: React.FC<{ type: string; size: number }> = ({ type, size }) => {
  const iconStyle = { width: size, height: size };

  switch (type) {
    // 工作类
    case 'coffee':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 8H19C20.1046 8 21 8.89543 21 10V11C21 12.1046 20.1046 13 19 13H18" stroke="#8B4513" strokeWidth="2" strokeLinecap="round"/>
          <path d="M2 8H16C17.1046 8 18 8.89543 18 10V11C18 12.1046 17.1046 13 16 13H2V8Z" stroke="#8B4513" strokeWidth="2"/>
          <path d="M4 13H14" stroke="#8B4513" strokeWidth="2" strokeLinecap="round"/>
          <path d="M6 16H12" stroke="#8B4513" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8 19H10" stroke="#8B4513" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    case 'laptop':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="20" height="14" rx="2" stroke="#4A90D9" strokeWidth="2"/>
          <path d="M2 18L6 14H18L22 18" stroke="#4A90D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 18H10" stroke="#4A90D9" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    case 'briefcase':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="7" width="20" height="14" rx="2" stroke="#8B4513" strokeWidth="2"/>
          <path d="M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7" stroke="#8B4513" strokeWidth="2"/>
          <path d="M12 12V16" stroke="#8B4513" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    case 'document':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4C4 2.89543 4.89543 2 6 2Z" stroke="#666" strokeWidth="2"/>
          <path d="M14 2V8H20" stroke="#666" strokeWidth="2"/>
          <path d="M8 13H16" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8 17H12" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    case 'pen':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 19L19 12L22 15L15 22L12 19Z" stroke="#4A90D9" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M18 13L11 6L2 2L6 11L13 18" stroke="#4A90D9" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      );

    // 健康类
    case 'pill':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="8" width="18" height="8" rx="4" fill="#FF6B6B"/>
          <rect x="3" y="8" width="9" height="8" rx="4" fill="#FF6B6B"/>
          <path d="M12 8V16" stroke="white" strokeWidth="2"/>
        </svg>
      );
    case 'heart':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill="#FF6B6B"/>
        </svg>
      );
    case 'bandage':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="8" width="16" height="8" rx="2" fill="#FFE4C4"/>
          <circle cx="8" cy="12" r="1.5" fill="#FFB6C1"/>
          <circle cx="12" cy="12" r="1.5" fill="#FFB6C1"/>
          <circle cx="16" cy="12" r="1.5" fill="#FFB6C1"/>
        </svg>
      );
    case 'apple':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 6C12 6 8 2 8 6C8 10 12 10 12 6Z" stroke="#5CB85C" strokeWidth="2"/>
          <path d="M17 11C17 16 14 21 9 21C4 21 2 16 2 11C2 6 4 3 9 3C14 3 17 6 17 11Z" fill="#FF6B6B"/>
        </svg>
      );
    case 'vitamin':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 4H16V20H8V4Z" fill="#FFD700"/>
          <path d="M8 4V2" stroke="#FFD700" strokeWidth="2"/>
          <path d="M16 4V2" stroke="#FFD700" strokeWidth="2"/>
          <path d="M8 20V22" stroke="#FFD700" strokeWidth="2"/>
          <path d="M16 20V22" stroke="#FFD700" strokeWidth="2"/>
        </svg>
      );

    // 生活类
    case 'house':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#4CAF50" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M9 22V12H15V22" stroke="#4CAF50" strokeWidth="2"/>
        </svg>
      );
    case 'plant':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22V12" stroke="#4CAF50" strokeWidth="2"/>
          <path d="M12 8C12 8 8 12 8 14C8 16 10 18 12 18C14 18 16 16 16 14C16 12 12 8 12 8Z" fill="#4CAF50"/>
          <path d="M8 14C8 14 6 16 6 17C6 18 7 19 8 19" stroke="#4CAF50" strokeWidth="2"/>
          <path d="M16 14C16 14 18 16 18 17C18 18 17 19 16 19" stroke="#4CAF50" strokeWidth="2"/>
          <rect x="9" y="18" width="6" height="4" fill="#8B4513"/>
        </svg>
      );
    case 'cup':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 10H16L18 20H2L4 10Z" fill="#FFB6C1"/>
          <path d="M18 10L20 6H22L18 10Z" fill="#FFB6C1"/>
          <path d="M6 14H14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    case 'flower':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="10" r="4" fill="#FFB6C1"/>
          <circle cx="12" cy="6" r="3" fill="#FFB6C1"/>
          <circle cx="16" cy="10" r="3" fill="#FFB6C1"/>
          <circle cx="12" cy="14" r="3" fill="#FFB6C1"/>
          <circle cx="8" cy="10" r="3" fill="#FFB6C1"/>
          <circle cx="12" cy="12" r="2" fill="#FFD700"/>
        </svg>
      );

    // 学习类
    case 'star':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFD700"/>
        </svg>
      );
    case 'lightbulb':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 21H15" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 17V21" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8.5 2.5C9.88071 1.62633 11.6023 1 13.5 1C16.5376 1 19 3.68629 19 7C19 8.9973 18.0604 10.7403 16.5 11.8643" stroke="#FFD700" strokeWidth="2"/>
          <path d="M15 14.5C16.1046 14.5 17 15.3954 17 16.5C17 17.6046 16.1046 18.5 15 18.5C13.8954 18.5 13 17.6046 13 16.5C13 15.3954 13.8954 14.5 15 14.5Z" fill="#FFD700"/>
        </svg>
      );
    case 'graduation':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 10V16C22 17.1046 21.1046 18 20 18H4C2.89543 18 2 17.1046 2 16V10" stroke="#8B4513" strokeWidth="2"/>
          <path d="M12 18V6L22 2V10" stroke="#8B4513" strokeWidth="2" strokeLinejoin="round"/>
          <circle cx="12" cy="18" r="3" fill="#8B4513"/>
        </svg>
      );
    case 'book':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="#4A90D9" strokeWidth="2"/>
          <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="#4A90D9" strokeWidth="2"/>
        </svg>
      );
    case 'pencil':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 2L22 6L7 21H3V17L18 2Z" stroke="#FFD700" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M18 2L22 6L12 16L9 17L10 14L18 2Z" fill="#FFD700"/>
        </svg>
      );

    // 其他类 - 可爱元素
    case 'snowflake':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2V22" stroke="#87CEEB" strokeWidth="2"/>
          <path d="M12 2L8 6M12 2L16 6M12 22L8 18M12 22L16 18" stroke="#87CEEB" strokeWidth="2"/>
          <path d="M4 12H20M4 12L8 8M4 12L8 16M20 12L16 8M20 12L16 16" stroke="#87CEEB" strokeWidth="2"/>
        </svg>
      );
    case 'cherry blossom':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="10" r="4" fill="#FFB7C5"/>
          <circle cx="12" cy="6" r="3" fill="#FFB7C5"/>
          <circle cx="16" cy="10" r="3" fill="#FFB7C5"/>
          <circle cx="12" cy="14" r="3" fill="#FFB7C5"/>
          <circle cx="8" cy="10" r="3" fill="#FFB7C5"/>
          <circle cx="12" cy="11" r="1.5" fill="#FFD700"/>
        </svg>
      );
    case 'chicken leg':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 12C6 12 8 8 14 6C20 4 22 8 20 12C18 16 14 18 10 16C6 14 6 12 6 12Z" fill="#FFA500"/>
          <path d="M20 12L22 14M20 12L18 15" stroke="#8B4513" strokeWidth="2" strokeLinecap="round"/>
          <path d="M10 16L8 19M10 16L7 18" stroke="#8B4513" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    case 'cake':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 16L6 8H18L20 16H4Z" fill="#FFB6C1"/>
          <rect x="6" y="16" width="12" height="4" fill="#FF69B4"/>
          <path d="M2 8H22" stroke="#FFB6C1" strokeWidth="2"/>
          <circle cx="12" cy="6" r="2" fill="#FF69B4"/>
        </svg>
      );
    case 'cookie':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" fill="#D2691E"/>
          <circle cx="8" cy="9" r="1.5" fill="#8B4513"/>
          <circle cx="15" cy="8" r="1" fill="#8B4513"/>
          <circle cx="16" cy="13" r="1.5" fill="#8B4513"/>
          <circle cx="10" cy="14" r="1" fill="#8B4513"/>
          <circle cx="6" cy="13" r="1" fill="#8B4513"/>
        </svg>
      );
    case 'candy':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 12C6 8 10 6 14 6C18 6 20 10 20 14C20 18 18 20 14 20C10 20 6 18 6 14" fill="#FF69B4"/>
          <path d="M14 6V20" stroke="#FF1493" strokeWidth="2"/>
          <path d="M8 8L6 4M16 8L18 4" stroke="#FF69B4" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );

    default:
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#FFD700" strokeWidth="2"/>
        </svg>
      );
  }
};

// Context 类型
interface FallingItemsContextType {
  items: FallingItem[];
  triggerFallingItems: (category: string) => void;
}

// 创建 Context
const FallingItemsContext = createContext<FallingItemsContextType>({
  items: [],
  triggerFallingItems: () => {},
});

// Provider 组件
export function FallingItemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FallingItem[]>([]);
  let itemIdCounter = 0;

  const triggerFallingItems = useCallback((category: string) => {
    const newItems: FallingItem[] = [];
    const itemTypes = getItemsByCategory(category);
    const itemCount = 8 + Math.floor(Math.random() * 5);

    for (let i = 0; i < itemCount; i++) {
      newItems.push({
        id: itemIdCounter++,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 1.5,
        rotation: Math.random() * 360,
        scale: 0.6 + Math.random() * 0.6,
        type: itemTypes[Math.floor(Math.random() * itemTypes.length)],
      });
    }

    setItems(newItems);

    // 4秒后清除
    setTimeout(() => {
      setItems([]);
    }, 4000);
  }, []);

  return (
    <FallingItemsContext.Provider value={{ items, triggerFallingItems }}>
      {children}
    </FallingItemsContext.Provider>
  );
}

// 使用 Context 的钩子
export function useFallingItems() {
  return useContext(FallingItemsContext);
}

// 彩蛋动画组件
export function FallingItemsLayer() {
  const { items } = useFallingItems();

  if (items.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(var(--rotation));
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(calc(var(--rotation) + 720deg));
            opacity: 0;
          }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation-fill-mode: forwards;
          will-change: transform, opacity;
        }
      `}</style>
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute animate-fall"
          style={{
            left: `${item.x}%`,
            top: '-50px',
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
            ['--rotation' as string]: `${item.rotation}deg`,
            transform: `scale(${item.scale})`,
          }}
        >
          <ItemIcon type={item.type} size={40} />
        </div>
      ))}
    </div>
  );
}

export default FallingItemsProvider;
