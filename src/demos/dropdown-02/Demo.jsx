/* src/demos/dropdown-02/Demo.jsx */
"use client";

import { useRef, useState } from "react";
import styles from "./Demo.module.css";

const menuItems = [
  {
    name: "build",
    subItems: ["description", "folder", "article"],
  },
  {
    name: "devices",
    subItems: ["storage", "mouse", "keyboard", "headphones"],
  },
  {
    name: "logout",
  },
];

function Icon({ icon, className = "" }) {
  return (
    <span
      className={`${styles.icon} ${className}`}
      aria-hidden='true'
    >
      {icon}
    </span>
  );
}

function MenuButton({ name, icon, hasSubItems = false, onClick }) {
  return (
    <button
      type='button'
      className={styles.menuButton}
      onClick={onClick}
    >
      <Icon icon={icon || name} />
      <span>{name}</span>

      {hasSubItems && (
        <Icon
          icon='chevron_right'
          className={styles.chevron}
        />
      )}
    </button>
  );
}

function MenuItem({ item, index, activeSubMenu, onSubMenuClick }) {
  const subMenuRef = useRef(null);
  const isActive = activeSubMenu === index;
  const hasSubItems = Boolean(item.subItems?.length);

  return (
    <>
      <MenuButton
        name={item.name}
        hasSubItems={hasSubItems}
        onClick={hasSubItems ? () => onSubMenuClick(index, subMenuRef.current) : undefined}
      />

      {hasSubItems && (
        <div
          ref={subMenuRef}
          className={`${styles.subMenu} ${isActive ? styles.subMenuOpen : ""}`}
        >
          <MenuButton
            name={item.name}
            icon='arrow_back'
            onClick={() => onSubMenuClick(-1)}
          />

          {item.subItems.map((subItem) => (
            <MenuButton
              key={subItem}
              name={subItem}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function Demo({ userName = "Kim Wilson", items = menuItems }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(-1);
  const [menuHeight, setMenuHeight] = useState(168);

  const handleSubMenuClick = (index, subMenuElement) => {
    if (index === -1) {
      setActiveSubMenu(-1);
      setMenuHeight(168);
      return;
    }

    setActiveSubMenu(index);

    if (subMenuElement) {
      setMenuHeight(subMenuElement.scrollHeight);
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
    setActiveSubMenu(-1);
    setMenuHeight(168);
  };

  return (
    <section className={styles.page}>
      <div className={`${styles.dropdown} ${isOpen ? styles.dropdownOpen : ""}`}>
        <button
          type='button'
          className={styles.trigger}
          aria-expanded={isOpen}
          onClick={() => {
            if (isOpen) {
              closeMenu();
            } else {
              setIsOpen(true);
            }
          }}
        >
          <Icon icon='account_circle' />
          <span>{userName}</span>
          <Icon
            icon='expand_more'
            className={styles.chevron}
          />
        </button>

        <div
          className={styles.menu}
          style={{ height: `${menuHeight}px` }}
        >
          <div className={`${styles.menuInner} ${activeSubMenu > -1 ? styles.menuInnerOpen : ""}`}>
            <div className={styles.mainMenu}>
              {items.map((item, index) => (
                <MenuItem
                  key={item.name}
                  item={item}
                  index={index}
                  activeSubMenu={activeSubMenu}
                  onSubMenuClick={handleSubMenuClick}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
