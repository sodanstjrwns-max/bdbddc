/**
 * 서울비디치과 Accessibility (A11y) JavaScript v1.0
 * WCAG 2.1 AA 준수
 * - 키보드 네비게이션 강화
 * - ARIA Live Region
 * - 스크린 리더 지원
 */

(function() {
  'use strict';

  // ========================================
  // 전역 접근성 객체
  // ========================================
  window.SeoulBDA11y = window.SeoulBDA11y || {};

  // ========================================
  // 1. 키보드 네비게이션 강화
  // ========================================
  const KeyboardNav = {
    init() {
      this.initDropdownKeyboard();
      this.initMegaMenuKeyboard();
      this.initFAQKeyboard();
      this.initModalKeyboard();
      this.initTabKeyboard();
      this.trackKeyboardUser();
    },

    // 키보드 사용자 감지 (포커스 스타일 표시)
    trackKeyboardUser() {
      let isKeyboardUser = false;

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          isKeyboardUser = true;
          document.body.classList.add('keyboard-user');
        }
      });

      document.addEventListener('mousedown', () => {
        isKeyboardUser = false;
        document.body.classList.remove('keyboard-user');
      });
    },

    // 드롭다운 메뉴 키보드 네비게이션
    initDropdownKeyboard() {
      const dropdownTriggers = document.querySelectorAll('.nav-item.has-dropdown > a, [aria-haspopup="true"]');

      dropdownTriggers.forEach(trigger => {
        const parent = trigger.closest('.nav-item') || trigger.parentElement;
        const dropdown = parent.querySelector('.dropdown-menu, .mega-dropdown, [role="menu"]');
        
        if (!dropdown) return;

        // ARIA 속성 설정
        trigger.setAttribute('aria-expanded', 'false');
        if (!dropdown.id) {
          dropdown.id = 'dropdown-' + Math.random().toString(36).substr(2, 9);
        }
        trigger.setAttribute('aria-controls', dropdown.id);
        dropdown.setAttribute('role', 'menu');

        // 드롭다운 내 링크들
        const menuItems = dropdown.querySelectorAll('a, button');
        menuItems.forEach((item, index) => {
          item.setAttribute('role', 'menuitem');
          item.setAttribute('tabindex', '-1');
        });

        // Enter/Space로 드롭다운 열기
        trigger.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggleDropdown(trigger, dropdown, true);
          }
          
          // 아래 화살표로 드롭다운 열고 첫 항목으로 이동
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.toggleDropdown(trigger, dropdown, true);
            const firstItem = dropdown.querySelector('a, button');
            if (firstItem) firstItem.focus();
          }
        });

        // 드롭다운 내 키보드 네비게이션
        dropdown.addEventListener('keydown', (e) => {
          const items = Array.from(dropdown.querySelectorAll('a:not([tabindex="-1"]), button:not([tabindex="-1"]), [role="menuitem"]'));
          const currentIndex = items.indexOf(document.activeElement);

          switch (e.key) {
            case 'ArrowDown':
              e.preventDefault();
              if (currentIndex < items.length - 1) {
                items[currentIndex + 1].focus();
              } else {
                items[0].focus(); // 순환
              }
              break;

            case 'ArrowUp':
              e.preventDefault();
              if (currentIndex > 0) {
                items[currentIndex - 1].focus();
              } else {
                items[items.length - 1].focus(); // 순환
              }
              break;

            case 'Escape':
              e.preventDefault();
              this.toggleDropdown(trigger, dropdown, false);
              trigger.focus();
              break;

            case 'Tab':
              // Tab 키로 드롭다운 밖으로 나가면 닫기
              if (!e.shiftKey && currentIndex === items.length - 1) {
                this.toggleDropdown(trigger, dropdown, false);
              }
              if (e.shiftKey && currentIndex === 0) {
                this.toggleDropdown(trigger, dropdown, false);
              }
              break;

            case 'Home':
              e.preventDefault();
              items[0].focus();
              break;

            case 'End':
              e.preventDefault();
              items[items.length - 1].focus();
              break;
          }
        });

        // 드롭다운 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
          if (!parent.contains(e.target)) {
            this.toggleDropdown(trigger, dropdown, false);
          }
        });
      });
    },

    toggleDropdown(trigger, dropdown, open) {
      const isOpen = open !== undefined ? open : trigger.getAttribute('aria-expanded') !== 'true';
      trigger.setAttribute('aria-expanded', isOpen.toString());
      
      const parent = trigger.closest('.nav-item') || trigger.parentElement;
      if (isOpen) {
        parent.classList.add('open');
        dropdown.style.display = '';
        // 첫 번째 메뉴 아이템에 tabindex 복원
        const items = dropdown.querySelectorAll('[role="menuitem"]');
        items.forEach((item, i) => {
          item.setAttribute('tabindex', i === 0 ? '0' : '-1');
        });
      } else {
        parent.classList.remove('open');
      }
    },

    // 메가 메뉴 키보드 네비게이션
    initMegaMenuKeyboard() {
      const megaMenus = document.querySelectorAll('.mega-dropdown');
      
      megaMenus.forEach(menu => {
        const columns = menu.querySelectorAll('.dropdown-column, .mega-column');
        
        menu.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const currentColumn = document.activeElement.closest('.dropdown-column, .mega-column');
            if (!currentColumn) return;

            const columnIndex = Array.from(columns).indexOf(currentColumn);
            let targetColumn;

            if (e.key === 'ArrowRight' && columnIndex < columns.length - 1) {
              targetColumn = columns[columnIndex + 1];
            } else if (e.key === 'ArrowLeft' && columnIndex > 0) {
              targetColumn = columns[columnIndex - 1];
            }

            if (targetColumn) {
              const firstLink = targetColumn.querySelector('a, button');
              if (firstLink) firstLink.focus();
            }
          }
        });
      });
    },

    // FAQ 아코디언 키보드 네비게이션
    initFAQKeyboard() {
      const faqItems = document.querySelectorAll('.faq-item');

      faqItems.forEach((item, index) => {
        const button = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (!button || !answer) return;

        // ARIA 속성 설정
        if (!answer.id) {
          answer.id = 'faq-answer-' + index;
        }
        button.setAttribute('aria-expanded', item.classList.contains('active').toString());
        button.setAttribute('aria-controls', answer.id);
        answer.setAttribute('role', 'region');
        answer.setAttribute('aria-labelledby', button.id || `faq-btn-${index}`);
        if (!button.id) button.id = `faq-btn-${index}`;

        // 키보드 이벤트
        button.addEventListener('keydown', (e) => {
          const allButtons = Array.from(document.querySelectorAll('.faq-question'));
          const currentIndex = allButtons.indexOf(button);

          switch (e.key) {
            case 'ArrowDown':
              e.preventDefault();
              if (currentIndex < allButtons.length - 1) {
                allButtons[currentIndex + 1].focus();
              }
              break;

            case 'ArrowUp':
              e.preventDefault();
              if (currentIndex > 0) {
                allButtons[currentIndex - 1].focus();
              }
              break;

            case 'Home':
              e.preventDefault();
              allButtons[0].focus();
              break;

            case 'End':
              e.preventDefault();
              allButtons[allButtons.length - 1].focus();
              break;
          }
        });

        // 토글 시 ARIA 업데이트
        button.addEventListener('click', () => {
          const isExpanded = item.classList.contains('active');
          button.setAttribute('aria-expanded', isExpanded.toString());
          SeoulBDA11y.announce(isExpanded ? '답변이 펼쳐졌습니다' : '답변이 접혔습니다');
        });
      });
    },

    // 모달 포커스 트랩
    initModalKeyboard() {
      const modals = document.querySelectorAll('[role="dialog"], .modal, .popup');

      modals.forEach(modal => {
        const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        
        modal.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            const closeBtn = modal.querySelector('.modal-close, .popup-close, [aria-label="닫기"]');
            if (closeBtn) closeBtn.click();
          }

          if (e.key === 'Tab') {
            const focusableElements = modal.querySelectorAll(focusableSelector);
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        });
      });
    },

    // 탭 패널 키보드 네비게이션
    initTabKeyboard() {
      const tabLists = document.querySelectorAll('[role="tablist"]');

      tabLists.forEach(tabList => {
        const tabs = tabList.querySelectorAll('[role="tab"]');

        tabs.forEach((tab, index) => {
          tab.addEventListener('keydown', (e) => {
            let targetIndex;

            switch (e.key) {
              case 'ArrowRight':
              case 'ArrowDown':
                e.preventDefault();
                targetIndex = index < tabs.length - 1 ? index + 1 : 0;
                break;

              case 'ArrowLeft':
              case 'ArrowUp':
                e.preventDefault();
                targetIndex = index > 0 ? index - 1 : tabs.length - 1;
                break;

              case 'Home':
                e.preventDefault();
                targetIndex = 0;
                break;

              case 'End':
                e.preventDefault();
                targetIndex = tabs.length - 1;
                break;

              default:
                return;
            }

            tabs[targetIndex].focus();
            tabs[targetIndex].click();
          });
        });
      });
    }
  };

  // ========================================
  // 2. ARIA Live Region 관리
  // ========================================
  const LiveRegion = {
    container: null,

    init() {
      this.createContainer();
    },

    createContainer() {
      // 스크린 리더 알림용 컨테이너
      this.container = document.createElement('div');
      this.container.id = 'a11y-announcer';
      this.container.setAttribute('aria-live', 'polite');
      this.container.setAttribute('aria-atomic', 'true');
      this.container.className = 'sr-only';
      this.container.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(this.container);

      // 시각적 알림용 (선택적)
      const visualAnnouncer = document.createElement('div');
      visualAnnouncer.id = 'a11y-visual-announcer';
      visualAnnouncer.className = 'a11y-announcement';
      visualAnnouncer.setAttribute('role', 'status');
      document.body.appendChild(visualAnnouncer);
    },

    announce(message, priority = 'polite', showVisual = false) {
      if (!this.container) this.createContainer();

      // 스크린 리더 알림
      this.container.setAttribute('aria-live', priority);
      this.container.textContent = '';
      
      // 약간의 지연 후 메시지 설정 (스크린 리더 호환성)
      setTimeout(() => {
        this.container.textContent = message;
      }, 100);

      // 시각적 알림 (선택적)
      if (showVisual) {
        const visualEl = document.getElementById('a11y-visual-announcer');
        if (visualEl) {
          visualEl.textContent = message;
          visualEl.classList.add('visible');
          setTimeout(() => {
            visualEl.classList.remove('visible');
          }, 3000);
        }
      }
    },

    announceAssertive(message) {
      this.announce(message, 'assertive', true);
    }
  };

  // ========================================
  // 3. 동적 콘텐츠 ARIA 업데이트
  // ========================================
  const DynamicContent = {
    init() {
      this.observeLoadingStates();
      this.observeFormValidation();
      this.observePageNavigation();
    },

    // 로딩 상태 알림
    observeLoadingStates() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target;
            
            // 로딩 시작
            if (target.classList.contains('loading')) {
              target.setAttribute('aria-busy', 'true');
              SeoulBDA11y.announce('로딩 중입니다');
            }
            
            // 로딩 완료
            if (!target.classList.contains('loading') && target.getAttribute('aria-busy') === 'true') {
              target.setAttribute('aria-busy', 'false');
              SeoulBDA11y.announce('로딩이 완료되었습니다');
            }
          }
        });
      });

      document.querySelectorAll('[data-loading]').forEach(el => {
        observer.observe(el, { attributes: true });
      });
    },

    // 폼 유효성 검사 알림
    observeFormValidation() {
      document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
          const invalidFields = form.querySelectorAll(':invalid');
          if (invalidFields.length > 0) {
            const fieldNames = Array.from(invalidFields)
              .map(f => f.labels?.[0]?.textContent || f.placeholder || f.name)
              .filter(Boolean)
              .join(', ');
            SeoulBDA11y.announceAssertive(`입력 오류가 있습니다: ${fieldNames}`);
          }
        });

        // 개별 필드 유효성 검사
        form.querySelectorAll('input, textarea, select').forEach(field => {
          field.addEventListener('invalid', () => {
            const label = field.labels?.[0]?.textContent || field.placeholder || field.name;
            field.setAttribute('aria-invalid', 'true');
            SeoulBDA11y.announce(`${label}: ${field.validationMessage}`);
          });

          field.addEventListener('input', () => {
            if (field.validity.valid) {
              field.setAttribute('aria-invalid', 'false');
            }
          });
        });
      });
    },

    // 페이지 내 네비게이션 알림
    observePageNavigation() {
      // 해시 변경 시 알림
      window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        const target = document.querySelector(hash);
        if (target) {
          const heading = target.querySelector('h1, h2, h3, h4, h5, h6');
          const title = heading?.textContent || target.getAttribute('aria-label') || '새 섹션';
          SeoulBDA11y.announce(`${title} 섹션으로 이동했습니다`);
        }
      });

      // 부드러운 스크롤 완료 시 포커스 이동
      document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
          const hash = link.getAttribute('href');
          const target = document.querySelector(hash);
          if (target) {
            setTimeout(() => {
              target.setAttribute('tabindex', '-1');
              target.focus();
            }, 500);
          }
        });
      });
    }
  };

  // ========================================
  // 4. 스킵 링크 초기화
  // ========================================
  function initSkipLinks() {
    const skipLink = document.querySelector('.skip-link');
    if (!skipLink) {
      // 스킵 링크 자동 생성
      const skip = document.createElement('a');
      skip.href = '#main-content';
      skip.className = 'skip-link';
      skip.textContent = '본문으로 바로가기';
      document.body.insertBefore(skip, document.body.firstChild);

      // main-content ID 확인/추가
      const main = document.querySelector('main, [role="main"], .main-content');
      if (main && !main.id) {
        main.id = 'main-content';
      }
    }
  }

  // ========================================
  // 5. 초기화
  // ========================================
  function init() {
    // DOM 로드 후 초기화
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initA11y);
    } else {
      initA11y();
    }
  }

  function initA11y() {
    KeyboardNav.init();
    LiveRegion.init();
    DynamicContent.init();
    initSkipLinks();

    // 프로덕션에서는 로그 비활성화
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
      console.log('🦮 서울비디치과 Accessibility v1.0 초기화 완료');
    }
  }

  // ========================================
  // 전역 API 노출
  // ========================================
  window.SeoulBDA11y = {
    announce: (msg, priority, visual) => LiveRegion.announce(msg, priority, visual),
    announceAssertive: (msg) => LiveRegion.announceAssertive(msg),
    KeyboardNav,
    LiveRegion,
    DynamicContent
  };

  init();

})();
