let db;
let budgetApp;

const request = indexedDB.open("BudgetDB", budgetApp || 1);

request.onupgradeneeded = function (e) {
    console.log("Upgrade needed!!");

    const { someVersion } = e;
    const betterVersion = e.betterVersion || db.version;
    console.log(`DB Updated from version ${someVersion} to ${betterVersion}`);

    db = e.target.result;
    if (db.objectStoreNames.length === 0) {
        db.createObjectStore('BudgetStore', { autoIncrement: true });
      }
    };

    request.onerror = function (e) {
        console.log(`You messed up! ${e.target.errorCode}`);
      };
      
      function checkDatabase() {
        console.log('check db called');
      
        let transaction = db.transaction(['BudgetStore'], 'readwrite');
      
        const store = transaction.objectStore('BudgetStore');
    
        const getAll = store.getAll();
      
        getAll.onsuccess = function () {
          if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
              method: 'POST',
              body: JSON.stringify(getAll.result),
              headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
              },
            })
              .then((response) => response.json())
              .then((res) => {
                if (res.length !== 0) {
                  transaction = db.transaction(['BudgetStore'], 'readwrite');
                  const currentStore = transaction.objectStore('BudgetStore');
                  currentStore.clear();
                  console.log('Clearing store');
                }
              });
          }
        };
      }
      
      request.onsuccess = function (e) {
        console.log('success');
        db = e.target.result;
        if (navigator.onLine) {
          console.log('Backend online!');
          checkDatabase();
        }
      };
      
      const saveRecord = (record) => {
        console.log('Save record invoked');
        const transaction = db.transaction(['BudgetStore'], 'readwrite');
        const store = transaction.objectStore('BudgetStore');
        store.add(record);
      };
      
      window.addEventListener('online', checkDatabase);