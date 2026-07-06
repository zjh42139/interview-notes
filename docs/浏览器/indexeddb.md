---
title: IndexedDB
description: IndexedDB 是浏览器端的 NoSQL 数据库，支持事务、索引、大容量存储和异步操作，是 LocalStorage 无法满足需求时的标准升级方案
category: 浏览器
difficulty: 中级
frequency: ⭐⭐⭐
status: filled
created: 2026-07-06
updated: 2026-07-06
tags:
  - IndexedDB
  - 离线存储
  - NoSQL
  - PWA
---

# IndexedDB

> "LocalStorage 只有 5MB，你项目里要缓存 100MB 的离线数据——数据往哪存？"IndexedDB 是标准答案。它是浏览器给你的"数据库"，不是键值对盒子，而是能建索引、能开事务的真数据库。

## 一句话总结

**IndexedDB 是浏览器内置的异步 NoSQL 数据库，支持对象存储（Object Store）、索引（Index）、事务（Transaction）和游标（Cursor），存储空间远超 LocalStorage（通常 250MB 以上，可达磁盘可用空间的 60%），适合离线数据缓存、PWA 数据同步和大文件存储场景。原生 API 基于事件回调较为繁琐，社区主流方案是 Dexie.js 或 idb 等 Promise 封装库。**

---

## 核心机制

### IndexedDB vs LocalStorage

在 [Web Storage](./storage.md) 的四种存储方案对比表中，IndexedDB 是"重型选手"。这里把两者的核心对比单拎出来：

| 维度 | LocalStorage | IndexedDB |
|------|-------------|-----------|
| **容量** | 5-10MB | 通常 250MB+（取决于浏览器和磁盘空间） |
| **数据类型** | 只能存字符串 | 任意类型：Object、Blob、File、ArrayBuffer |
| **API** | 同步（阻塞主线程） | **异步**（事件驱动，不阻塞主线程） |
| **查询能力** | 只能 `getItem(key)` 全量读取 | **索引查询、范围查询、游标遍历** |
| **事务** | 无 | **支持 ACID 事务**（readonly / readwrite） |
| **并发控制** | 无（后写覆盖先写） | 事务锁（同 store 的读写事务排队） |
| **结构** | 扁平键值对 | **对象存储（Object Store）**：类似表 |
| **适用场景** | 主题偏好、表单草稿、少量配置 | 离线数据缓存、大文件、复杂查询 |

### 核心 API 流程

IndexedDB 的操作遵循固定的流程：**打开数据库 → 创建/获取 Object Store → 开启事务 → 执行操作 → 处理结果**。

```javascript
// 1. 打开（或创建）数据库
const request = indexedDB.open('MyAppDB', 2);

// 2. 数据库首次创建或版本升级时触发
request.onupgradeneeded = (event) => {
  const db = event.target.result;

  // 创建 Object Store（类似表），指定主键
  if (!db.objectStoreNames.contains('documents')) {
    const store = db.createObjectStore('documents', {
      keyPath: 'id',          // 主键字段
      autoIncrement: true,     // 自增主键
    });

    // 创建索引（加速查询）
    store.createIndex('title', 'title', { unique: false });
    store.createIndex('updatedAt', 'updatedAt', { unique: false });
  }

  // 版本 2 新增的 Store
  if (!db.objectStoreNames.contains('attachments')) {
    db.createObjectStore('attachments', { keyPath: 'hash' });
  }
};

// 3. 成功后进行操作
request.onsuccess = (event) => {
  const db = event.target.result;
  addDocument(db, { title: '面试笔记', content: '...', updatedAt: Date.now() });
};

// 4. 错误处理
request.onerror = (event) => {
  console.error('IndexedDB 打开失败:', event.target.error);
};
```

### 事务（Transaction）机制

IndexedDB 的所有读写操作**必须**在事务中完成。事务是 IndexedDB 保证数据一致性的核心：

```javascript
function addDocument(db, doc) {
  // 开启只读/读写事务，指定操作的 Object Store
  const tx = db.transaction(['documents'], 'readwrite');
  const store = tx.objectStore('documents');

  const addRequest = store.add(doc);

  addRequest.onsuccess = () => {
    console.log('文档已保存，id:', addRequest.result);
  };

  // 事务完成时触发
  tx.oncomplete = () => {
    console.log('事务完成');
  };

  tx.onerror = (e) => {
    console.error('事务失败:', e.target.error);
  };
}
```

**事务的三个关键特性**：

1. **ACID**：原子性——事务中任一操作失败，全部回滚。
2. **作用域固定**：事务创建时就必须声明涉及哪些 Object Store，之后不能更改。
3. **自动提交**：浏览器事件循环的下一个 microtask 中没有 pending 的请求时，事务自动提交。这意味着你的所有操作必须在同一个同步/异步链中完成。

### 索引查询（Index）

这是 IndexedDB 和 LocalStorage 最本质的区别——LocalStorage 只能按 key 全量读取，IndexedDB 可以只查需要的记录：

```javascript
function searchByTitle(db, keyword) {
  const tx = db.transaction(['documents'], 'readonly');
  const store = tx.objectStore('documents');
  const titleIndex = store.index('title');

  // 按索引范围查询
  const range = IDBKeyRange.bound(keyword, keyword + '￿'); // 前缀匹配
  const results = [];

  const cursorRequest = titleIndex.openCursor(range);
  cursorRequest.onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      results.push(cursor.value);
      cursor.continue();  // 继续下一条
    } else {
      console.log('查询完成:', results);
    }
  };
}
```

**游标（Cursor）**：当查询结果可能很多时（成千上万条），游标机制让你可以逐条处理，避免一次性加载所有数据到内存。

---

## 深度拓展

### 追问1："LocalStorage 存不下的数据怎么办？"——标准面试问法

这是面试中最常见的 IndexedDB 引入问题。核心回答逻辑：

1. **先判断数据规模和类型**：如果只是超出几 MB，但仍是简单键值对 → 将大块数据分片存储（多个 key）也可行，但不优雅。
2. **需要查询能力**：LocalStorage 无法对值做索引查询，如果需求是"按创建时间排序查询最近的 N 条记录" → 只能用 IndexedDB。
3. **标准的升级路径**：小量键值对 → LocalStorage；离线缓存 + 索引查询 → IndexedDB；需要跨标签页实时同步 → IndexedDB + BroadcastChannel。

**延伸回答**：如果你不需要索引，只想要"LocalStorage 的大容量版"，可以考虑 `Cache Storage`（配合 Service Worker）或 `localForage`（自动降级方案：优先 IndexedDB，不可用时降级到 LocalStorage）。

### 追问2：封装库的选择：idb vs Dexie.js

原生 IndexedDB API 是出了名的难用——事件嵌套和多层回调让代码可读性极差。社区有两个主流封装方案：

| 维度 | idb | Dexie.js |
|------|-----|----------|
| **定位** | 轻量 Promise 封装（~2KB） | 全功能 ORM 风格封装（~20KB） |
| **API 风格** | 接近原生，将事件转为 Promise | 链式调用，`db.table.where(...).toArray()` |
| **学习成本** | 低（你需要理解 IndexedDB 概念） | 极低（几乎不需要了解原生 API） |
| **TypeScript 支持** | 良好 | 优秀，天生 TS 友好 |
| **适合场景** | 只需要简单 CRUD + Promise | 复杂查询、关联查询、数据同步、Schema 版本管理 |

**idb 示例**：

```javascript
import { openDB } from 'idb';

const db = await openDB('MyDB', 1, {
  upgrade(db) {
    db.createObjectStore('docs', { keyPath: 'id', autoIncrement: true });
  },
});

await db.add('docs', { title: 'Hello' });
const doc = await db.get('docs', 1);
const all = await db.getAll('docs');
```

**Dexie.js 示例**：

```javascript
import Dexie from 'dexie';

const db = new Dexie('MyDB');
db.version(1).stores({ docs: '++id, title, updatedAt' });

// 链式查询
const recentDocs = await db.docs
  .where('updatedAt')
  .above(Date.now() - 86400000)
  .reverse()
  .sortBy('updatedAt');
```

**推荐**：简单项目用 `idb`（轻量零依赖），复杂数据模型和查询用 `Dexie.js`（开发效率高，反模式护城河）。

### 追问3：IndexedDB 的存储限制和浏览器差异

- **Chrome**：可用空间约等于磁盘可用空间的 60%，单个源（Origin）上限约为 20% 的可用空间。
- **Firefox**：全局上限约 50% 的可用空间，单个源上限约 20%。
- **Safari**：最严格——单个源 7 天后未使用会被自动清理，上限约 1GB。

**最佳实践**：不要假设"无限容量"，始终通过 `navigator.storage.estimate()` 检查配额使用情况：

```javascript
const estimate = await navigator.storage.estimate();
console.log(`已用: ${(estimate.usage / 1024 / 1024).toFixed(2)} MB`);
console.log(`配额: ${(estimate.quota / 1024 / 1024).toFixed(2)} MB`);

// 请求持久化存储（减少被浏览器自动清理的概率）
if (navigator.storage.persist) {
  const granted = await navigator.storage.persist();
  console.log(granted ? '持久化存储已授权' : '持久化存储被拒绝');
}
```

---

## 项目实战

### 1. 离线字典数据缓存

后台系统中，省市区列表、行业分类、产品类型等"字典数据"是高频只读数据。每次打开页面都从服务器拉取浪费带宽和时间，存在 IndexedDB 中按需更新：

```javascript
import Dexie from 'dexie';

class DictCache extends Dexie {
  constructor() {
    super('DictCacheDB');
    this.version(1).stores({ dicts: '&code', '++id' });
    this.dicts = this.table('dicts');
  }
}

const dictDB = new DictCache();

export async function getDict(code) {
  const cached = await dictDB.dicts.get({ code });
  const MAX_AGE = 24 * 3600 * 1000; // 24 小时

  if (cached && Date.now() - cached.cachedAt < MAX_AGE) {
    return cached.data;
  }

  // 过期或未缓存，走网络
  const res = await fetch(`/api/dict/${code}`);
  const data = await res.json();
  await dictDB.dicts.put({ code, data, cachedAt: Date.now() });
  return data;
}
```

### 2. 聊天消息离线存储

IM 系统中，用户发送消息后可能需要离线暂存（网络断开时）。IndexedDB 的事务机制保证消息不会丢失或重复写入：

```javascript
const MSG_STORE = 'messages';

// 初始化
function initChatDB() {
  const req = indexedDB.open('ChatDB', 1);
  req.onupgradeneeded = (e) => {
    const db = e.target.result;
    const store = db.createObjectStore(MSG_STORE, { keyPath: 'clientId' });
    store.createIndex('conversationId', 'conversationId', { unique: false });
    store.createIndex('timestamp', 'timestamp', { unique: false });
  };
  return req;
}

// 批量离线消息写入
async function saveOfflineMessages(db, messages) {
  const tx = db.transaction([MSG_STORE], 'readwrite');
  const store = tx.objectStore(MSG_STORE);
  for (const msg of messages) {
    store.put(msg); // put 会覆盖同 key 的记录，避免重复
  }
  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}
```

### 3. PWA 数据同步：后端 + IndexedDB + Service Worker

完整的离线数据方案通常涉及三个角色：Service Worker 做网络代理和缓存策略，IndexedDB 做结构化数据本地存储，后端提供数据同步接口。用户在离线状态下做出的修改先写入 IndexedDB，网络恢复后通过 Background Sync 或定期轮询同步到服务器。

---

## 易错点

- **"IndexedDB 是同步 API"**：不是。IndexedDB 的所有操作都是**异步的**（基于事件回调）。这是它和 LocalStorage 的重要区别之一——异步设计确保它不会阻塞主线程，适合处理大量数据。
- **"所有浏览器都支持 IndexedDB"**：基本正确，但**不能忽视 Safari 的差异**。Safari 对 IndexedDB 的支持较晚且持续在改进中，另外在隐私浏览模式下（Private Browsing）某些版本不支持 IndexedDB。做好降级方案。
- **"创建了 Object Store 就能用"**：不完全。`createObjectStore` 只能在 `onupgradeneeded` 事件中调用——不能在普通的事务中动态创建。如果需要新增 Store，必须**提升数据库版本号**，在版本升级回调中创建。
- **"IndexedDB 可以替代后端数据库"**：不能。IndexedDB 是**客户端**数据库，数据存在用户浏览器里——无法多端同步、无法做权限控制、容量受限于浏览器。它是后端的离线兜底，不是替代品。
- **"事务不提交就是失败的"**：实际上事务会自动提交。如果不显式调用 `tx.abort()`，也没有任何错误，事务会在空闲时自动提交。真正的坑是忘记在事务完成后再读取数据——必须在 `tx.oncomplete` 之后。
- **"Safari 7 天自动清理是谣言"**：不完全。Safari 对超过 7 天未使用的**网站数据**（包括 IndexedDB）确实有自动清理策略，但可以通过 `navigator.storage.persist()` 请求持久化来降低被清理的概率。

---

## 相关阅读

- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN: Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)
- [Dexie.js 官方文档](https://dexie.org/)
- [idb (npm)](https://www.npmjs.com/package/idb)
- [Google: Storage for the web](https://web.dev/articles/storage-for-the-web)
- [storage](./storage.md) —— 四种浏览器存储方案的完整对比和选择指南
- [service-worker](./service-worker.md) —— Service Worker + IndexedDB 的离线方案
- [cache](./cache) —— Cache Storage 和 IndexedDB 在离线策略中的分工

---

## 更新记录

- 2026-07-06：完成完整内容，补充原生 API 流程、idb 和 Dexie.js 对比、离线存储实战、浏览器差异和配额管理
