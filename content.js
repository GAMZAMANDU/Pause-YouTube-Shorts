(function() {
  // shorts-container 스크롤 방지
  const style = document.createElement('style');
  style.textContent = `
    #shorts-container {
      overflow: hidden !important;
    }
  `;
  document.head.appendChild(style);
  
  // navigation-container 클래스를 가진 요소 삭제
  function removeNavigationContainer() {
    const navContainers = document.getElementsByClassName('navigation-container');
    while(navContainers.length > 0) {
      navContainers[0].remove();
    }
  }
  
  // 초기 실행
  removeNavigationContainer();
  
  // 동적으로 추가되는 요소를 위한 MutationObserver
  const observer = new MutationObserver(() => {
    removeNavigationContainer();
  });
  
  // body의 변화 감시
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();
