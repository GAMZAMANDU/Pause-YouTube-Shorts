(function () {
  // 현재 URL 저장
  let currentUrl = window.location.href;
  
  // 스타일 요소 생성 (한 번만 생성)
  const style = document.createElement("style");
  style.textContent = `
    #shorts-container {
      overflow: hidden !important;
    }
  `;
  
  // navigation-container 삭제 함수
  function removeNavigationContainer() {
    const navContainers = document.querySelectorAll(".navigation-container");
    navContainers.forEach(container => container.remove());
    
    // 추가: shorts-player 내부의 스크롤 방지
    const shortsPlayer = document.querySelector("ytd-shorts");
    if (shortsPlayer) {
      shortsPlayer.style.overflow = "hidden";
    }
  }
  
  // 쇼츠 페이지 처리 함수
  function handleShortsPage() {
    // 스타일이 아직 추가되지 않았다면 추가
    if (!document.head.contains(style)) {
      document.head.appendChild(style);
    }
    
    // navigation-container 제거
    removeNavigationContainer();
    
    // MutationObserver 설정
    setupObserver();
    
    // 백업으로 interval 설정
    if (!window.shortsIntervalId) {
      window.shortsIntervalId = setInterval(removeNavigationContainer, 200);
    }
  }
  
  // MutationObserver 설정 함수
  function setupObserver() {
    // 이미 observer가 있다면 중복 설정 방지
    if (window.shortsObserver) return;
    
    window.shortsObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          removeNavigationContainer();
        }
      }
    });
    
    // 문서 전체 관찰
    window.shortsObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
  
  // URL 변경 감지 함수
  function checkUrlChange() {
    const newUrl = window.location.href;
    
    // URL이 변경되었는지 확인
    if (newUrl !== currentUrl) {
      currentUrl = newUrl;
      
      // 쇼츠 페이지인지 확인
      if (newUrl.includes('youtube.com/shorts')) {
        console.log("쇼츠 페이지 감지됨, 기능 활성화");
        handleShortsPage();
      } else {
        // 쇼츠 페이지가 아니면 observer와 interval 정리
        if (window.shortsObserver) {
          window.shortsObserver.disconnect();
          window.shortsObserver = null;
        }
        
        if (window.shortsIntervalId) {
          clearInterval(window.shortsIntervalId);
          window.shortsIntervalId = null;
        }
      }
    }
  }
  
  // 초기 실행
  if (window.location.href.includes('youtube.com/shorts')) {
    handleShortsPage();
  }
  
  // URL 변경 감지 interval 설정 (YouTube의 히스토리 API 변경 감지용)
  setInterval(checkUrlChange, 500);
  
  // 히스토리 API 후킹 (YouTube의 pushState 감지)
  const originalPushState = history.pushState;
  history.pushState = function() {
    originalPushState.apply(this, arguments);
    checkUrlChange();
  };
  
  // popstate 이벤트 리스너 (뒤로가기/앞으로가기 감지)
  window.addEventListener('popstate', checkUrlChange);
})();
