const urlParams = new URLSearchParams(window.location.search);
const fromCMSExtension = urlParams.get('fromCMS');
const searchStr = urlParams.get("q")
console.log("Asdasd");
if (fromCMSExtension) {
  console.log("Let's go!");
  // Click on the first search result
  const results = document.querySelector(".course-search-result");
  const subjectCode = urlParams.get("q");
  if (!results) {
    // No results found
    chrome.storage.local.get("subjects", (result) => {
      const newSubj = result.subjects.map(s => {
        if (s.subject == subjectCode) {
          return { ...s, error: "Course not found." };
        } else return s;
      })
      chrome.storage.local.set({ subjects: newSubj }, (e) => { });
      chrome.runtime.sendMessage({ closeThis: true });
    })
  }
  // If it is not an "L" section and there are multiple search results, log the error
  else if (results.children.length > 1 && !/\bL\b/ig.test(subjectCode)) {
    chrome.storage.local.get("subjects", (result) => {
      const newSubj = result.subjects.map(s => {
        if (s.subject == subjectCode) {
          return { ...s, error: "Multiple search results found." };
        } else return s;
      })
      chrome.storage.local.set({ subjects: newSubj }, (e) => { });
      chrome.runtime.sendMessage({ closeThis: true });
    })
  } else {
    const subNameInSearch = results.children[0].getElementsByTagName("a")[0].innerText;
    let [whole, subjectCode, code] = [...searchStr.matchAll(/(\w+)\s*(F\d{3})/ig)][0];
    if ((new RegExp(`\\b${subjectCode}\\b`)).test(subNameInSearch)) {
      const link = results.children[0].getElementsByTagName("a")[0].getAttribute("href");
      window.location.href = link + "&fromCMS=1";
    } else {
      chrome.storage.local.get("subjects", res => {
        const newSubjects = res.subjects;
        for (let i = 0; i < newSubjects.length; i++) {
          const s = newSubjects[i];
          if (s.code == `${subjectCode} ${code}`) {
            s.error = "Course not found";
            break;
          }
        }
        chrome.storage.local.set({ subjects: newSubjects }, e => {
          chrome.runtime.sendMessage({ closeThis: true });
        });
      })
    }
  }
}
