// 확장 프로그램이 활성화되었을 때 실행
chrome.runtime.onInstalled.addListener(() => {
  console.log("Pause-YouTube-Shorts 확장 프로그램이 설치되었습니다.");
});

// 탭 업데이트 감지
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com/shorts')) {
    // 콘텐츠 스크립트 재실행
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
  }
});
