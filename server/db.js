const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const uuidv4 = randomUUID;

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Đảm bảo thư mục lưu trữ data tồn tại
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Tự động nạp cấu hình từ file .env nếu có
const envPaths = [path.join(__dirname, '.env'), path.join(__dirname, '..', '.env')];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.substring(0, eqIdx).trim();
            const val = trimmed.substring(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    } catch (e) {}
  }
}


// Dữ liệu mẫu chuẩn Hội đồng nhân dân xã Phước Trà
const INITIAL_DATA = {
  sessions: [
    {
      id: "session-phuoc-tra-01",
      name: "Kỳ họp thứ 8 (Kỳ họp thường lệ) - HĐND xã Phước Trà Khóa XII, Nhiệm kỳ 2021 - 2026",
      session_code: "KH-08-KXII",
      location: "Hội trường tầng 2 - UBND xã Phước Trà",
      date: new Date().toLocaleDateString('vi-VN'),
      total_delegates: 17, // Tổng số đại biểu triệu tập theo luật của HĐND xã Phước Trà
      is_active: true,
      active_agenda_id: "agenda-01",
      voting_status: "idle", // 'idle' | 'voting' | 'locked' | 'published'
      voting_time_remaining: 30,
      voting_duration: 30,
      voting_started_at: null,
      created_at: new Date().toISOString()
    }
  ],
  delegates: [
    { id: "db-01", session_id: "session-phuoc-tra-01", seat_number: "ĐB-01", name: "Nguyễn Văn Nam", title: "Bí thư Đảng ủy", group_name: "Tổ 1 - Đảng ủy, HĐND, UBND, UBMT", pin: "1111", is_present: true, is_online: false },
    { id: "db-02", session_id: "session-phuoc-tra-01", seat_number: "ĐB-02", name: "Trần Quốc Trí", title: "PBT TT Đảng ủy", group_name: "Tổ 1 - Đảng ủy, HĐND, UBND, UBMT", pin: "2222", is_present: true, is_online: false },
    { id: "db-03", session_id: "session-phuoc-tra-01", seat_number: "ĐB-03", name: "Hoàng Văn Hùng", title: "PBT Đảng ủy - CT UBND", group_name: "Tổ 1 - Đảng ủy, HĐND, UBND, UBMT", pin: "3333", is_present: true, is_online: false },
    { id: "db-04", session_id: "session-phuoc-tra-01", seat_number: "ĐB-04", name: "Võ Ngọc Phương", title: "PCT HĐND", group_name: "Tổ 1 - Đảng ủy, HĐND, UBND, UBMT", pin: "4444", is_present: true, is_online: false },
    { id: "db-05", session_id: "session-phuoc-tra-01", seat_number: "ĐB-05", name: "Đặng Thị Ngọc Lan", title: "CT UBMT", group_name: "Tổ 1 - Đảng ủy, HĐND, UBND, UBMT", pin: "1005", is_present: true, is_online: false },
    { id: "db-06", session_id: "session-phuoc-tra-01", seat_number: "ĐB-06", name: "Nguyễn Tấn Nghiệp", title: "PCT UBND", group_name: "Tổ 1 - Đảng ủy, HĐND, UBND, UBMT", pin: "1006", is_present: true, is_online: false },
    { id: "db-07", session_id: "session-phuoc-tra-01", seat_number: "ĐB-07", name: "Nguyễn Hồng Sơn", title: "Trưởng Ban VH-XH", group_name: "Tổ 2 - Các Ban HĐND & Đoàn thể", pin: "1007", is_present: true, is_online: false },
    { id: "db-08", session_id: "session-phuoc-tra-01", seat_number: "ĐB-08", name: "Nguyễn Thị Lệ Thắm", title: "Trưởng Ban KT-NS", group_name: "Tổ 2 - Các Ban HĐND & Đoàn thể", pin: "1008", is_present: true, is_online: false },
    { id: "db-09", session_id: "session-phuoc-tra-01", seat_number: "ĐB-09", name: "Hồ Văn Sinh", title: "Phó Ban KTNS", group_name: "Tổ 2 - Các Ban HĐND & Đoàn thể", pin: "1009", is_present: true, is_online: false },
    { id: "db-10", session_id: "session-phuoc-tra-01", seat_number: "ĐB-10", name: "Nguyễn Văn Lợi", title: "Phó Ban VH-XH", group_name: "Tổ 2 - Các Ban HĐND & Đoàn thể", pin: "1010", is_present: true, is_online: false },
    { id: "db-11", session_id: "session-phuoc-tra-01", seat_number: "ĐB-11", name: "Hồ Thị Danh", title: "Bí thư Đoàn TN", group_name: "Tổ 2 - Các Ban HĐND & Đoàn thể", pin: "1011", is_present: true, is_online: false },
    { id: "db-12", session_id: "session-phuoc-tra-01", seat_number: "ĐB-12", name: "Phạm Chí Sang", title: "CT Hội ND", group_name: "Tổ 2 - Các Ban HĐND & Đoàn thể", pin: "1012", is_present: true, is_online: false },
    { id: "db-13", session_id: "session-phuoc-tra-01", seat_number: "ĐB-13", name: "Nguyễn Văn Vinh", title: "Trưởng Công an xã", group_name: "Tổ 2 - Các Ban HĐND & Đoàn thể", pin: "1013", is_present: true, is_online: false },
    { id: "db-14", session_id: "session-phuoc-tra-01", seat_number: "ĐB-14", name: "Nguyễn Văn Cường", title: "Bí Thư thôn Trà Sơn", group_name: "Tổ 3 - Thôn Trà Sơn, Trà Nô, Hạ Sơn", pin: "1014", is_present: true, is_online: false },
    { id: "db-15", session_id: "session-phuoc-tra-01", seat_number: "ĐB-15", name: "Hồ Văn Chi", title: "Bí thư Chi bộ thôn Trà Nô", group_name: "Tổ 3 - Thôn Trà Sơn, Trà Nô, Hạ Sơn", pin: "1015", is_present: true, is_online: false },
    { id: "db-16", session_id: "session-phuoc-tra-01", seat_number: "ĐB-16", name: "Hồ Ngọc Xanh", title: "BT kiêm trưởng thôn Hạ Sơn", group_name: "Tổ 3 - Thôn Trà Sơn, Trà Nô, Hạ Sơn", pin: "1016", is_present: true, is_online: false },
    { id: "db-17", session_id: "session-phuoc-tra-01", seat_number: "ĐB-17", name: "Trần Anh Đức", title: "Đại biểu HĐND", group_name: "Tổ 3 - Thôn Trà Sơn, Trà Nô, Hạ Sơn", pin: "1017", is_present: true, is_online: false }
  ],
  agendas: [
    {
      id: "agenda-01",
      session_id: "session-phuoc-tra-01",
      order_num: 1,
      code: "NQ-01/NQ-HĐND",
      title: "Thông qua Báo cáo tình hình phát triển Kinh tế - Xã hội, Quốc phòng - An ninh năm 2026 và phương hướng nhiệm vụ năm 2027",
      description: "Biểu quyết thông qua toàn văn Báo cáo số 45/BC-UBND của UBND xã Phước Trà về kết quả đạt được và chỉ tiêu phát triển KTXH năm 2027.",
      default_duration: 30,
      status: "pending", // 'pending' | 'voting' | 'locked' | 'published'
      required_ratio: 0.5 // > 50% tổng số đại biểu triệu tập (tối thiểu 9/17 tán thành)
    },
    {
      id: "agenda-02",
      session_id: "session-phuoc-tra-01",
      order_num: 2,
      code: "NQ-02/NQ-HĐND",
      title: "Thông qua Dự toán phân bổ thu, chi ngân sách xã và Kế hoạch đầu tư công năm 2027",
      description: "Biểu quyết phê chuẩn tổng mức thu ngân sách dự kiến 14,2 tỷ đồng và danh mục 6 công trình giao thông nông thôn xã Phước Trà.",
      default_duration: 45,
      status: "pending",
      required_ratio: 0.5
    },
    {
      id: "agenda-03",
      session_id: "session-phuoc-tra-01",
      order_num: 3,
      code: "NQ-03/NQ-HĐND",
      title: "Thông qua Đề án xây dựng xã Nông thôn mới nâng cao giai đoạn 2026 - 2030",
      description: "Biểu quyết các chỉ tiêu trọng tâm: Nâng cấp đường trục thôn xóm, cơ sở vật chất văn hóa, trường học đạt chuẩn quốc gia.",
      default_duration: 30,
      status: "pending",
      required_ratio: 0.5
    },
    {
      id: "agenda-04",
      session_id: "session-phuoc-tra-01",
      order_num: 4,
      code: "NQ-04/NQ-HĐND",
      title: "Biểu quyết miễn nhiệm và bầu bổ sung Ủy viên UBND xã Phước Trà Khóa XII",
      description: "Bầu bổ sung Ủy viên UBND phụ trách lĩnh vực Địa chính - Nông nghiệp - Xây dựng và Môi trường.",
      default_duration: 60,
      status: "pending",
      required_ratio: 0.5
    }
  ],
  votes: [],
  configs: {
    system_name: "Hệ thống Biểu quyết Điện tử HĐND xã Phước Trà",
    display_title: "HỘI ĐỒNG NHÂN DÂN XÃ PHƯỚC TRÀ",
    show_live_results: true,
    audio_chime: true
  }
};

// Quản lý bộ nhớ đệm (In-Memory Cache) & Ghi đĩa an toàn, tối ưu tải đồng thời cao (>100 truy cập/giây)
let memoryDb = null;
let isWriting = false;
let hasPendingWrite = false;

// Tích hợp Cloud Database MongoDB Atlas (Lưu trữ vĩnh viễn không bao giờ mất trên Cloud Render)
let mongoClient = null;
let mongoCollection = null;
let isMongoConnected = false;

async function initMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[Database] MONGODB_URI chưa được cấu hình. Sử dụng file database.json cục bộ.');
    return false;
  }

  try {
    const { MongoClient } = require('mongodb');
    console.log('[Database] Đang kết nối tới Cloud Database MongoDB Atlas...');
    mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 10000,
    });
    await mongoClient.connect();
    const db = mongoClient.db('evote_phuoc_tra');
    mongoCollection = db.collection('meeting_state');
    isMongoConnected = true;
    console.log('✓ KẾT NỐI MONGODB ATLAS THÀNH CÔNG! Dữ liệu được lưu vĩnh viễn trên Cloud.');

    // Nạp dữ liệu từ Cloud vào bộ nhớ RAM
    const cloudDoc = await mongoCollection.findOne({ _id: 'current_meeting_state' });
    if (cloudDoc && cloudDoc.data) {
      memoryDb = cloudDoc.data;
      saveDbImmediate(memoryDb);
      console.log('✓ Đã đồng bộ dữ liệu phiên họp từ Cloud MongoDB Atlas vào RAM.');
    } else {
      await mongoCollection.updateOne(
        { _id: 'current_meeting_state' },
        { $set: { data: memoryDb || readDb(), updatedAt: new Date() } },
        { upsert: true }
      );
      console.log('✓ Đã khởi tạo dữ liệu mẫu lên MongoDB Atlas.');
    }
    return true;
  } catch (err) {
    console.error('⚠ Không thể kết nối MongoDB Atlas (sử dụng database.json dự phòng):', err.message);
    isMongoConnected = false;
    return false;
  }
}

function syncToMongoAsync(data) {
  if (!isMongoConnected || !mongoCollection) return;
  mongoCollection.updateOne(
    { _id: 'current_meeting_state' },
    { $set: { data: data, updatedAt: new Date() } },
    { upsert: true }
  ).catch(err => {
    console.error('Lỗi sync Cloud MongoDB:', err.message);
  });
}

// Tích hợp Cloud PostgreSQL (Neon.tech / Supabase qua biến môi trường DATABASE_URL)
let pgPool = null;
let isPgConnected = false;

async function initPg() {
  const uri = process.env.DATABASE_URL;
  if (!uri) return false;

  try {
    const { Pool } = require('pg');
    console.log('[Database] Đang kết nối tới Cloud PostgreSQL (Neon / Supabase)...');
    pgPool = new Pool({
      connectionString: uri,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000
    });

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS meeting_state (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    isPgConnected = true;
    console.log('✓ KẾT NỐI CLOUD POSTGRESQL (NEON / SUPABASE) THÀNH CÔNG! Dữ liệu được lưu vĩnh viễn trên Cloud.');

    const res = await pgPool.query(`SELECT data FROM meeting_state WHERE id = 'current_meeting_state';`);
    if (res.rows.length > 0 && res.rows[0].data) {
      memoryDb = res.rows[0].data;
      saveDbImmediate(memoryDb);
      console.log('✓ Đã đồng bộ dữ liệu phiên họp từ Cloud PostgreSQL vào RAM.');
    } else {
      await pgPool.query(
        `INSERT INTO meeting_state (id, data, updated_at) VALUES ('current_meeting_state', $1, NOW())
         ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = NOW();`,
        [JSON.stringify(memoryDb || readDb())]
      );
      console.log('✓ Đã khởi tạo dữ liệu mẫu lên Cloud PostgreSQL.');
    }
    return true;
  } catch (err) {
    console.error('⚠ Không thể kết nối Cloud PostgreSQL (sử dụng database.json dự phòng):', err.message);
    isPgConnected = false;
    return false;
  }
}

function syncToPgAsync(data) {
  if (!isPgConnected || !pgPool) return;
  pgPool.query(
    `INSERT INTO meeting_state (id, data, updated_at) VALUES ('current_meeting_state', $1, NOW())
     ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = NOW();`,
    [JSON.stringify(data)]
  ).catch(err => {
    console.error('Lỗi sync Cloud PostgreSQL:', err.message);
  });
}

// Tích hợp TiDB Cloud Serverless (MySQL 5GB miễn phí vĩnh viễn qua TIDB_URL hoặc TIDB_HOST hoặc DATABASE_URL bắt đầu bằng mysql)
let mysqlPool = null;
let isMysqlConnected = false;
let mysqlActiveDb = 'test';
let lastDatabaseError = null;

// Trình phân tích URI MySQL siêu an toàn, chống lỗi ký tự đặc biệt trong mật khẩu
function parseMysqlUri(rawUri) {
  let uri = (rawUri || '').trim().replace(/^['"]|['"]$/g, '');
  uri = uri.replace(/^(mysql|mysql2|tidb):\/\//i, '');
  const qIndex = uri.indexOf('?');
  let pathPart = qIndex !== -1 ? uri.substring(0, qIndex) : uri;
  const atIndex = pathPart.lastIndexOf('@');
  let user = 'root', password = '', host = 'localhost', port = 4000, database = 'test';
  if (atIndex !== -1) {
    const credPart = pathPart.substring(0, atIndex);
    const hostDbPart = pathPart.substring(atIndex + 1);
    const cIndex = credPart.indexOf(':');
    if (cIndex !== -1) {
      user = decodeURIComponent(credPart.substring(0, cIndex));
      password = decodeURIComponent(credPart.substring(cIndex + 1));
    } else {
      user = decodeURIComponent(credPart);
    }
    const slashIndex = hostDbPart.indexOf('/');
    let hostPortPart = slashIndex !== -1 ? hostDbPart.substring(0, slashIndex) : hostDbPart;
    if (slashIndex !== -1) {
      const dbStr = hostDbPart.substring(slashIndex + 1).trim();
      if (dbStr) database = dbStr;
    }
    const pIndex = hostPortPart.indexOf(':');
    if (pIndex !== -1) {
      host = hostPortPart.substring(0, pIndex);
      port = parseInt(hostPortPart.substring(pIndex + 1), 10) || 4000;
    } else {
      host = hostPortPart;
    }
  }
  return { user, password, host, port, database: database || 'test' };
}

async function initMysql(retries = 3, delayMs = 1500) {
  // Tự động nạp file cấu hình cloud đã lưu nếu biến môi trường chưa có
  const cloudConfigPath = path.join(DATA_DIR, 'cloud_config.json');
  if (fs.existsSync(cloudConfigPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(cloudConfigPath, 'utf8'));
      if (cfg.TIDB_URL && !process.env.TIDB_URL) {
        process.env.TIDB_URL = cfg.TIDB_URL;
      }
    } catch (e) {}
  }

  const uri = process.env.TIDB_URL || 
              process.env.TIDB_URI || 
              process.env.MYSQL_URL || 
              process.env.MYSQL_URI || 
              process.env.TIDB_CONNECTION_STRING ||
              (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgres') && !process.env.DATABASE_URL.startsWith('mongodb') ? process.env.DATABASE_URL : null);

  let host = process.env.TIDB_HOST || process.env.MYSQL_HOST;
  let port = parseInt(process.env.TIDB_PORT || process.env.MYSQL_PORT, 10) || 4000;
  let user = process.env.TIDB_USER || process.env.MYSQL_USER;
  let password = process.env.TIDB_PASSWORD || process.env.MYSQL_PASSWORD;
  let database = process.env.TIDB_DATABASE || process.env.MYSQL_DATABASE || 'test';

  if (uri && !host) {
    const parsed = parseMysqlUri(uri);
    host = parsed.host;
    port = parsed.port;
    user = parsed.user;
    password = parsed.password;
    database = parsed.database || 'test';
  }

  if (!host || host === 'localhost') {
    lastDatabaseError = 'Chưa cấu hình chuỗi kết nối Cloud Database (TIDB_URL hoặc TIDB_HOST)';
    return false;
  }

  mysqlActiveDb = database || 'test';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const mysql = require('mysql2/promise');
      console.log(`[Database] Đang kết nối TiDB Cloud (Lần thử ${attempt}/${retries}): Host=${host}, Port=${port}, User=${user}, Database=${mysqlActiveDb}...`);

      if (mysqlPool) {
        try { await mysqlPool.end(); } catch (e) {}
        mysqlPool = null;
      }

      mysqlPool = mysql.createPool({
        host,
        port,
        user,
        password,
        database: mysqlActiveDb,
        ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        connectTimeout: 15000
      });

      // Kiểm tra kết nối cơ sở dữ liệu
      await mysqlPool.query(`SELECT 1;`);
      await mysqlPool.query(`USE \`${mysqlActiveDb}\`;`);

      isMysqlConnected = true;
      lastDatabaseError = null;
      console.log(`✓ KẾT NỐI TIDB CLOUD SERVERLESS (${mysqlActiveDb}) THÀNH CÔNG! Dữ liệu được lưu vĩnh viễn trên Cloud.`);

      // Tạo bảng an toàn, không bị văng lỗi nếu một bảng đã tồn tại
      const safeCreate = async (sql, tableName) => {
        try {
          await mysqlPool.query(sql);
        } catch (err) {
          console.warn(`[TiDB Warning] Tạo bảng ${tableName}:`, err.message);
        }
      };

      await safeCreate(`
        CREATE TABLE IF NOT EXISTS \`${mysqlActiveDb}\`.\`meeting_state\` (
          \`id\` VARCHAR(50) PRIMARY KEY,
          \`data\` LONGTEXT NOT NULL,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `, 'meeting_state');

      await safeCreate(`
        CREATE TABLE IF NOT EXISTS \`${mysqlActiveDb}\`.\`sessions\` (
          \`id\` VARCHAR(50) PRIMARY KEY,
          \`name\` VARCHAR(500) NOT NULL,
          \`session_code\` VARCHAR(100),
          \`location\` VARCHAR(500),
          \`date\` VARCHAR(100),
          \`total_delegates\` INT DEFAULT 17,
          \`is_active\` INT DEFAULT 1,
          \`active_agenda_id\` VARCHAR(50),
          \`voting_status\` VARCHAR(50) DEFAULT 'idle',
          \`voting_time_remaining\` INT DEFAULT 30,
          \`voting_duration\` INT DEFAULT 30,
          \`voting_started_at\` VARCHAR(100),
          \`created_at\` VARCHAR(100),
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `, 'sessions');

      await safeCreate(`
        CREATE TABLE IF NOT EXISTS \`${mysqlActiveDb}\`.\`agendas\` (
          \`id\` VARCHAR(50) PRIMARY KEY,
          \`session_id\` VARCHAR(50),
          \`order_num\` INT DEFAULT 1,
          \`code\` VARCHAR(100),
          \`title\` TEXT NOT NULL,
          \`description\` LONGTEXT,
          \`default_duration\` INT DEFAULT 30,
          \`status\` VARCHAR(50) DEFAULT 'pending',
          \`required_ratio\` DOUBLE DEFAULT 0.5,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `, 'agendas');

      await safeCreate(`
        CREATE TABLE IF NOT EXISTS \`${mysqlActiveDb}\`.\`delegates\` (
          \`id\` VARCHAR(50) PRIMARY KEY,
          \`session_id\` VARCHAR(50),
          \`seat_number\` VARCHAR(50) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`title\` VARCHAR(255),
          \`group_name\` VARCHAR(255),
          \`pin\` VARCHAR(50),
          \`is_present\` INT DEFAULT 1,
          \`is_online\` INT DEFAULT 0,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `, 'delegates');

      await safeCreate(`
        CREATE TABLE IF NOT EXISTS \`${mysqlActiveDb}\`.\`votes\` (
          \`id\` VARCHAR(50) PRIMARY KEY,
          \`agenda_id\` VARCHAR(50) NOT NULL,
          \`delegate_id\` VARCHAR(50) NOT NULL,
          \`choice\` VARCHAR(50) NOT NULL,
          \`voted_at\` VARCHAR(100),
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `, 'votes');

      await safeCreate(`
        CREATE TABLE IF NOT EXISTS \`${mysqlActiveDb}\`.\`system_config\` (
          \`config_key\` VARCHAR(100) PRIMARY KEY,
          \`config_value\` LONGTEXT,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `, 'system_config');

      // Hydration dữ liệu
      try {
        const [sessionCountRows] = await mysqlPool.query(
          `SELECT COUNT(*) AS total FROM \`${mysqlActiveDb}\`.\`sessions\`;`
        );
        const hasStructuredData = sessionCountRows && sessionCountRows[0] && sessionCountRows[0].total > 0;

        if (hasStructuredData) {
          const [sessions] = await mysqlPool.query(`SELECT * FROM \`${mysqlActiveDb}\`.\`sessions\`;`);
          const [agendas] = await mysqlPool.query(`SELECT * FROM \`${mysqlActiveDb}\`.\`agendas\` ORDER BY order_num ASC;`);
          const [delegates] = await mysqlPool.query(`SELECT * FROM \`${mysqlActiveDb}\`.\`delegates\` ORDER BY seat_number ASC;`);
          const [votes] = await mysqlPool.query(`SELECT * FROM \`${mysqlActiveDb}\`.\`votes\`;`);
          const [configs] = await mysqlPool.query(`SELECT * FROM \`${mysqlActiveDb}\`.\`system_config\`;`);

          const loadedConfigs = {};
          if (Array.isArray(configs)) {
            configs.forEach(c => {
              try { loadedConfigs[c.config_key] = JSON.parse(c.config_value); } catch (e) { loadedConfigs[c.config_key] = c.config_value; }
            });
          }

          memoryDb = {
            sessions: sessions.map(s => ({
              id: s.id,
              name: s.name,
              session_code: s.session_code || '',
              location: s.location || '',
              date: s.date || '',
              total_delegates: parseInt(s.total_delegates, 10) || 17,
              is_active: Boolean(s.is_active),
              active_agenda_id: s.active_agenda_id || null,
              voting_status: s.voting_status || 'idle',
              voting_time_remaining: parseInt(s.voting_time_remaining, 10) || 30,
              voting_duration: parseInt(s.voting_duration, 10) || 30,
              voting_started_at: s.voting_started_at || null,
              created_at: s.created_at || new Date().toISOString()
            })),
            agendas: agendas.map(a => ({
              id: a.id,
              session_id: a.session_id,
              order_num: parseInt(a.order_num, 10) || 1,
              code: a.code || '',
              title: a.title,
              description: a.description || '',
              default_duration: parseInt(a.default_duration, 10) || 30,
              status: a.status || 'pending',
              required_ratio: parseFloat(a.required_ratio) || 0.5
            })),
            delegates: delegates.map(d => ({
              id: d.id,
              session_id: d.session_id,
              seat_number: d.seat_number,
              name: d.name,
              title: d.title || '',
              group_name: d.group_name || '',
              pin: String(d.pin || ''),
              is_present: Boolean(d.is_present),
              is_online: false
            })),
            votes: votes.map(v => ({
              id: v.id,
              agenda_id: v.agenda_id,
              delegate_id: v.delegate_id,
              choice: v.choice,
              voted_at: v.voted_at || new Date().toISOString()
            })),
            configs: Object.keys(loadedConfigs).length > 0 ? loadedConfigs : (INITIAL_DATA.configs || {})
          };

          saveDbImmediate(memoryDb);
          console.log(`✓ [TiDB Cloud] Đã phục hồi dữ liệu từ các bảng chức năng: ${memoryDb.sessions.length} phiên họp, ${memoryDb.agendas.length} chỉ tiêu, ${memoryDb.delegates.length} đại biểu.`);
        } else {
          const [legacyRows] = await mysqlPool.query(
            `SELECT data FROM \`${mysqlActiveDb}\`.\`meeting_state\` WHERE id = 'current_meeting_state' LIMIT 1;`
          );
          let baseData = null;
          if (legacyRows && legacyRows.length > 0 && legacyRows[0].data) {
            baseData = typeof legacyRows[0].data === 'string' ? JSON.parse(legacyRows[0].data) : legacyRows[0].data;
            console.log('✓ [TiDB Cloud] Tìm thấy snapshot từ meeting_state! Đang nạp vào các bảng chức năng...');
          } else {
            baseData = memoryDb || readDb();
            console.log('✓ [TiDB Cloud] Khởi tạo dữ liệu mẫu lần đầu vào các bảng chức năng...');
          }
          memoryDb = baseData;
          await syncToMysqlDirect(baseData);
          saveDbImmediate(memoryDb);
        }
      } catch (hydrationErr) {
        console.warn('Lỗi hydration dữ liệu (giữ nguyên cache RAM):', hydrationErr.message);
      }

      return true;
    } catch (err) {
      lastDatabaseError = err.message;
      console.error(`⚠ [Lần ${attempt}/${retries}] Không thể kết nối TiDB Cloud:`, err.message);
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }

  isMysqlConnected = false;
  return false;
}

// Đồng bộ trực tiếp cấu trúc phân rã vào từng bảng chức năng
async function syncToMysqlDirect(data) {
  if (!isMysqlConnected || !mysqlPool) return;

  let conn = null;
  try {
    conn = await mysqlPool.getConnection();
    await conn.query(`USE \`${mysqlActiveDb}\`;`);

    // 1. Đồng bộ bảng sessions (Kỳ họp & Cấu hình)
    if (Array.isArray(data.sessions) && data.sessions.length > 0) {
      for (const s of data.sessions) {
        await conn.query(`
          INSERT INTO \`${mysqlActiveDb}\`.\`sessions\`
          (id, name, session_code, location, date, total_delegates, is_active, active_agenda_id, voting_status, voting_time_remaining, voting_duration, voting_started_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            session_code = VALUES(session_code),
            location = VALUES(location),
            date = VALUES(date),
            total_delegates = VALUES(total_delegates),
            is_active = VALUES(is_active),
            active_agenda_id = VALUES(active_agenda_id),
            voting_status = VALUES(voting_status),
            voting_time_remaining = VALUES(voting_time_remaining),
            voting_duration = VALUES(voting_duration),
            voting_started_at = VALUES(voting_started_at);
        `, [
          s.id,
          s.name || 'Kỳ họp HĐND',
          s.session_code || '',
          s.location || '',
          s.date || '',
          parseInt(s.total_delegates, 10) || 17,
          s.is_active ? 1 : 0,
          s.active_agenda_id || null,
          s.voting_status || 'idle',
          parseInt(s.voting_time_remaining, 10) || 30,
          parseInt(s.voting_duration, 10) || 30,
          s.voting_started_at || null,
          s.created_at || new Date().toISOString()
        ]);
      }

      const sessionIds = data.sessions.map(s => s.id);
      if (sessionIds.length > 0) {
        const sPlaceholders = sessionIds.map(() => '?').join(',');
        await conn.query(`DELETE FROM \`${mysqlActiveDb}\`.\`sessions\` WHERE id NOT IN (${sPlaceholders});`, sessionIds);
      }
    }

    // 2. Đồng bộ bảng agendas (Danh mục Chỉ tiêu / Nghị quyết)
    if (Array.isArray(data.agendas)) {
      if (data.agendas.length === 0) {
        await conn.query(`DELETE FROM \`${mysqlActiveDb}\`.\`agendas\`;`);
      } else {
        for (const a of data.agendas) {
          await conn.query(`
            INSERT INTO \`${mysqlActiveDb}\`.\`agendas\`
            (id, session_id, order_num, code, title, description, default_duration, status, required_ratio)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              session_id = VALUES(session_id),
              order_num = VALUES(order_num),
              code = VALUES(code),
              title = VALUES(title),
              description = VALUES(description),
              default_duration = VALUES(default_duration),
              status = VALUES(status),
              required_ratio = VALUES(required_ratio);
          `, [
            a.id,
            a.session_id || null,
            parseInt(a.order_num, 10) || 1,
            a.code || '',
            a.title || '',
            a.description || '',
            parseInt(a.default_duration, 10) || 30,
            a.status || 'pending',
            parseFloat(a.required_ratio) || 0.5
          ]);
        }

        const agendaIds = data.agendas.map(a => a.id);
        const aPlaceholders = agendaIds.map(() => '?').join(',');
        await conn.query(`DELETE FROM \`${mysqlActiveDb}\`.\`agendas\` WHERE id NOT IN (${aPlaceholders});`, agendaIds);
      }
    }

    // 3. Đồng bộ bảng delegates (Đại biểu & Điểm danh)
    if (Array.isArray(data.delegates)) {
      if (data.delegates.length === 0) {
        await conn.query(`DELETE FROM \`${mysqlActiveDb}\`.\`delegates\`;`);
      } else {
        for (const d of data.delegates) {
          await conn.query(`
            INSERT INTO \`${mysqlActiveDb}\`.\`delegates\`
            (id, session_id, seat_number, name, title, group_name, pin, is_present, is_online)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              session_id = VALUES(session_id),
              seat_number = VALUES(seat_number),
              name = VALUES(name),
              title = VALUES(title),
              group_name = VALUES(group_name),
              pin = VALUES(pin),
              is_present = VALUES(is_present),
              is_online = VALUES(is_online);
          `, [
            d.id,
            d.session_id || null,
            d.seat_number || '',
            d.name || '',
            d.title || '',
            d.group_name || '',
            String(d.pin || ''),
            d.is_present ? 1 : 0,
            d.is_online ? 1 : 0
          ]);
        }

        const delegateIds = data.delegates.map(d => d.id);
        const dPlaceholders = delegateIds.map(() => '?').join(',');
        await conn.query(`DELETE FROM \`${mysqlActiveDb}\`.\`delegates\` WHERE id NOT IN (${dPlaceholders});`, delegateIds);
      }
    }

    // 4. Đồng bộ bảng votes (Phiếu biểu quyết)
    if (Array.isArray(data.votes)) {
      if (data.votes.length === 0) {
        await conn.query(`DELETE FROM \`${mysqlActiveDb}\`.\`votes\`;`);
      } else {
        for (const v of data.votes) {
          await conn.query(`
            INSERT INTO \`${mysqlActiveDb}\`.\`votes\`
            (id, agenda_id, delegate_id, choice, voted_at)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              choice = VALUES(choice),
              voted_at = VALUES(voted_at);
          `, [
            v.id,
            v.agenda_id,
            v.delegate_id,
            v.choice,
            v.voted_at || new Date().toISOString()
          ]);
        }

        const voteIds = data.votes.map(v => v.id);
        const vPlaceholders = voteIds.map(() => '?').join(',');
        await conn.query(`DELETE FROM \`${mysqlActiveDb}\`.\`votes\` WHERE id NOT IN (${vPlaceholders});`, voteIds);
      }
    }

    // 5. Đồng bộ bảng system_config (Cấu hình hệ thống)
    if (data.configs && typeof data.configs === 'object') {
      for (const [key, value] of Object.entries(data.configs)) {
        const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        await conn.query(`
          INSERT INTO \`${mysqlActiveDb}\`.\`system_config\` (config_key, config_value)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);
        `, [key, valStr]);
      }
    }

    // 6. Đồng bộ snapshot dự phòng meeting_state
    await conn.query(`
      INSERT INTO \`${mysqlActiveDb}\`.\`meeting_state\` (id, data, updated_at)
      VALUES ('current_meeting_state', ?, NOW())
      ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = NOW();
    `, [JSON.stringify(data)]);

  } catch (err) {
    console.error('⚠ Lỗi đồng bộ TiDB Cloud Serverless:', err.message);
  } finally {
    if (conn) conn.release();
  }
}

function syncToMysqlAsync(data) {
  if (!isMysqlConnected || !mysqlPool) return;
  setImmediate(() => {
    syncToMysqlDirect(data).catch(err => {
      console.error('Lỗi sync async TiDB Cloud:', err.message);
    });
  });
}

// Đọc dữ liệu (ưu tiên bộ nhớ RAM siêu tốc, 0ms, không nghẽn I/O ổ đĩa)
function readDb() {
  if (memoryDb) {
    if (!memoryDb.configs) memoryDb.configs = JSON.parse(JSON.stringify(INITIAL_DATA.configs || {}));
    return memoryDb;
  }
  try {
    if (!fs.existsSync(DB_FILE)) {
      memoryDb = JSON.parse(JSON.stringify(INITIAL_DATA));
      saveDbImmediate(memoryDb);
      return memoryDb;
    }
    const content = fs.readFileSync(DB_FILE, 'utf8');
    memoryDb = JSON.parse(content);
    if (!memoryDb.configs) {
      memoryDb.configs = JSON.parse(JSON.stringify(INITIAL_DATA.configs || {}));
      saveDbImmediate(memoryDb);
    }
    return memoryDb;
  } catch (error) {
    console.error("Lỗi đọc cơ sở dữ liệu:", error);
    memoryDb = JSON.parse(JSON.stringify(INITIAL_DATA));
    return memoryDb;
  }
}

// Ghi đĩa đồng bộ tức thì (dùng khi khởi tạo hoặc reset)
function saveDbImmediate(data) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
    syncToMongoAsync(data);
    syncToPgAsync(data);
    syncToMysqlAsync(data);
  } catch (error) {
    console.error("Lỗi ghi cơ sở dữ liệu tức thì:", error);
  }
}

// Ghi dữ liệu an toàn theo hàng đợi (Serialized Async Queue)
// Đảm bảo khi 18+ đại biểu cùng bấm biểu quyết ở cùng 1 tích tắc, không bị xung đột khóa file (EBUSY) trên Windows/Linux
function writeDb(data) {
  memoryDb = data; // Cập nhật ngay lập tức trong RAM (đơn luồng Node.js không bao giờ race condition)
  syncToMongoAsync(data); // Tự động đồng bộ lên Cloud MongoDB Atlas
  syncToPgAsync(data); // Tự động đồng bộ lên Cloud PostgreSQL (Neon/Supabase)
  syncToMysqlAsync(data); // Tự động đồng bộ lên Cloud TiDB (MySQL)

  if (isWriting) {
    hasPendingWrite = true;
    return;
  }

  isWriting = true;
  hasPendingWrite = false;

  setImmediate(() => {
    try {
      const snapshot = JSON.stringify(memoryDb, null, 2);
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, snapshot, 'utf8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (error) {
      console.error("Lỗi ghi cơ sở dữ liệu async:", error);
    } finally {
      isWriting = false;
      if (hasPendingWrite) {
        writeDb(memoryDb);
      }
    }
  });
}

class Database {
  // --- SESSIONS ---
  static getActiveSession() {
    const db = readDb();
    let session = db.sessions.find(s => s.is_active);
    if (!session && db.sessions.length > 0) {
      session = db.sessions[0];
      session.is_active = true;
      writeDb(db);
    }
    return session;
  }

  static getSessions() {
    return readDb().sessions;
  }

  static createSession(sessionData) {
    const db = readDb();
    const newSession = {
      id: uuidv4(),
      name: sessionData.name || "Kỳ họp HĐND mới",
      session_code: sessionData.session_code || `KH-${Date.now().toString().slice(-4)}`,
      location: sessionData.location || "Hội trường UBND xã Phước Trà",
      date: sessionData.date || new Date().toLocaleDateString('vi-VN'),
      total_delegates: parseInt(sessionData.total_delegates, 10) || 25,
      is_active: false,
      active_agenda_id: null,
      voting_status: "idle",
      voting_time_remaining: 30,
      voting_duration: 30,
      created_at: new Date().toISOString()
    };
    db.sessions.push(newSession);
    writeDb(db);
    return newSession;
  }

  static setActiveSession(sessionId) {
    const db = readDb();
    db.sessions.forEach(s => {
      s.is_active = (s.id === sessionId);
    });
    writeDb(db);
    return this.getActiveSession();
  }

  static updateSessionState(sessionId, updateFields) {
    const db = readDb();
    const session = db.sessions.find(s => s.id === sessionId);
    if (session) {
      Object.assign(session, updateFields);
      writeDb(db);
    }
    return session;
  }

  // --- DELEGATES ---
  static getDelegates(sessionId) {
    const db = readDb();
    return db.delegates.filter(d => !sessionId || !d.session_id || d.session_id === sessionId);
  }

  static getDelegateById(id) {
    const db = readDb();
    return db.delegates.find(d => d.id === id);
  }

  static updateDelegate(id, updates) {
    const db = readDb();
    const delegate = db.delegates.find(d => d.id === id);
    if (delegate) {
      Object.assign(delegate, updates);
      writeDb(db);
    }
    return delegate;
  }

  static addDelegate(delegateData) {
    const db = readDb();
    const newDelegate = {
      id: uuidv4(),
      session_id: delegateData.session_id,
      seat_number: delegateData.seat_number || `ĐB-${db.delegates.length + 1}`,
      name: delegateData.name,
      title: delegateData.title || "Đại biểu HĐND",
      group_name: delegateData.group_name || "Tổ đại biểu",
      pin: delegateData.pin || Math.floor(1000 + Math.random() * 9000).toString(),
      is_present: delegateData.is_present !== undefined ? delegateData.is_present : true,
      is_online: false
    };
    db.delegates.push(newDelegate);
    writeDb(db);
    return newDelegate;
  }

  static deleteDelegate(id) {
    const db = readDb();
    db.delegates = db.delegates.filter(d => d.id !== id);
    db.votes = db.votes.filter(v => v.delegate_id !== id);
    writeDb(db);
    return true;
  }

  static checkinAllDelegates(sessionId, isPresent = true) {
    const db = readDb();
    db.delegates.forEach(d => {
      if (!sessionId || !d.session_id || d.session_id === sessionId) {
        d.is_present = isPresent;
      }
    });
    writeDb(db);
    return db.delegates;
  }

  // --- AGENDAS ---
  static getAgendas(sessionId) {
    const db = readDb();
    return db.agendas
      .filter(a => !sessionId || !a.session_id || a.session_id === sessionId)
      .sort((a, b) => (a.order_num || 0) - (b.order_num || 0));
  }

  static getAgendaById(id) {
    const db = readDb();
    return db.agendas.find(a => a.id === id);
  }

  static createAgenda(agendaData) {
    const db = readDb();
    const existing = db.agendas.filter(a => a.session_id === agendaData.session_id);
    const newAgenda = {
      id: uuidv4(),
      session_id: agendaData.session_id,
      order_num: agendaData.order_num || (existing.length + 1),
      code: agendaData.code || `NQ-0${existing.length + 1}/NQ-HĐND`,
      title: agendaData.title,
      description: agendaData.description || "",
      default_duration: parseInt(agendaData.default_duration, 10) || 30,
      status: "pending",
      required_ratio: parseFloat(agendaData.required_ratio) || 0.5
    };
    db.agendas.push(newAgenda);
    writeDb(db);
    return newAgenda;
  }

  static updateAgenda(id, updates) {
    const db = readDb();
    const agenda = db.agendas.find(a => a.id === id);
    if (agenda) {
      Object.assign(agenda, updates);
      writeDb(db);
    }
    return agenda;
  }

  static deleteAgenda(id) {
    const db = readDb();
    db.agendas = db.agendas.filter(a => a.id !== id);
    db.votes = db.votes.filter(v => v.agenda_id !== id);
    // Nếu kỳ họp đang chọn chỉ tiêu này thì chuyển sang chỉ tiêu kế tiếp hoặc null
    db.sessions.forEach(s => {
      if (s.active_agenda_id === id) {
        const remaining = db.agendas.filter(a => a.session_id === s.id);
        s.active_agenda_id = remaining.length > 0 ? remaining[0].id : null;
        s.voting_status = 'idle';
      }
    });
    writeDb(db);
    return true;
  }

  // --- VOTES ---
  static castVote(agendaId, delegateId, choice) {
    const db = readDb();
    // Kiểm tra xem đại biểu đã vote nội dung này chưa, nếu rồi thì cập nhật
    let vote = db.votes.find(v => v.agenda_id === agendaId && v.delegate_id === delegateId);
    if (vote) {
      vote.choice = choice;
      vote.voted_at = new Date().toISOString();
    } else {
      vote = {
        id: uuidv4(),
        agenda_id: agendaId,
        delegate_id: delegateId,
        choice: choice, // 'agree' | 'disagree' | 'neutral'
        voted_at: new Date().toISOString()
      };
      db.votes.push(vote);
    }
    writeDb(db);
    return vote;
  }

  static getVotesForAgenda(agendaId) {
    const db = readDb();
    return db.votes.filter(v => v.agenda_id === agendaId);
  }

  static resetVotesForAgenda(agendaId) {
    const db = readDb();
    db.votes = db.votes.filter(v => v.agenda_id !== agendaId);
    const agenda = db.agendas.find(a => a.id === agendaId);
    if (agenda) {
      agenda.status = "pending";
    }
    writeDb(db);
    return true;
  }

  // Tính toán kết quả biểu quyết chuẩn theo Luật HĐND
  static calculateResults(agendaId, sessionId) {
    const db = readDb();
    const session = db.sessions.find(s => s.id === sessionId) || this.getActiveSession();
    const agenda = agendaId ? db.agendas.find(a => a.id === agendaId) : null;
    const delegates = db.delegates.filter(d => !session || !d.session_id || d.session_id === session.id);
    const votes = agendaId ? db.votes.filter(v => v.agenda_id === agendaId) : [];

    const totalDelegates = session ? Math.max(session.total_delegates || 0, delegates.length) : delegates.length;
    const presentDelegates = delegates.filter(d => d.is_present).length;
    const absentDelegates = Math.max(0, totalDelegates - presentDelegates);

    if (!agenda) {
      return {
        agenda: null,
        session_name: session ? session.name : "",
        total_delegates: totalDelegates,
        present_delegates: presentDelegates,
        absent_delegates: absentDelegates,
        total_voted: 0,
        not_voted_count: presentDelegates,
        agree_count: 0,
        agree_percent_present: "0.0",
        agree_percent_total: "0.0",
        disagree_count: 0,
        disagree_percent_present: "0.0",
        neutral_count: 0,
        neutral_percent_present: "0.0",
        is_passed: false,
        required_ratio: 0.5,
        delegate_status_list: delegates.map(d => ({
          id: d.id,
          seat_number: d.seat_number,
          name: d.name,
          group_name: d.group_name,
          is_present: d.is_present,
          is_online: d.is_online,
          has_voted: false,
          choice: null,
          voted_at: null
        }))
      };
    }

    let agreeCount = 0;
    let disagreeCount = 0;
    let neutralCount = 0;

    votes.forEach(v => {
      if (v.choice === 'agree') agreeCount++;
      else if (v.choice === 'disagree') disagreeCount++;
      else if (v.choice === 'neutral') neutralCount++;
    });

    const totalVoted = votes.length;
    const notVotedCount = Math.max(0, presentDelegates - totalVoted);

    // Tỷ lệ phần trăm tính trên số ĐB có mặt
    const agreePercentPresent = presentDelegates > 0 ? ((agreeCount / presentDelegates) * 100).toFixed(1) : "0.0";
    const disagreePercentPresent = presentDelegates > 0 ? ((disagreeCount / presentDelegates) * 100).toFixed(1) : "0.0";
    const neutralPercentPresent = presentDelegates > 0 ? ((neutralCount / presentDelegates) * 100).toFixed(1) : "0.0";

    // Tỷ lệ phần trăm tính trên TỔNG SỐ ĐẠI BIỂU TRIỆU TẬP (Cơ sở pháp lý HĐND)
    const agreePercentTotal = totalDelegates > 0 ? ((agreeCount / totalDelegates) * 100).toFixed(1) : "0.0";
    const requiredRatio = (agenda && agenda.required_ratio) || 0.5;
    const isPassed = (agreeCount / totalDelegates) > requiredRatio; // Quá nửa tổng số ĐB triệu tập

    // Chi tiết từng đại biểu và trạng thái biểu quyết
    const delegateVotingStatus = delegates.map(d => {
      const voteItem = votes.find(v => v.delegate_id === d.id);
      return {
        id: d.id,
        seat_number: d.seat_number,
        name: d.name,
        group_name: d.group_name,
        is_present: d.is_present,
        is_online: d.is_online,
        has_voted: !!voteItem,
        choice: voteItem ? voteItem.choice : null,
        voted_at: voteItem ? voteItem.voted_at : null
      };
    });

    return {
      agenda: agenda || null,
      session_name: session ? session.name : "",
      total_delegates: totalDelegates,
      present_delegates: presentDelegates,
      absent_delegates: Math.max(0, totalDelegates - presentDelegates),
      total_voted: totalVoted,
      not_voted_count: notVotedCount,
      agree_count: agreeCount,
      agree_percent_present: agreePercentPresent,
      agree_percent_total: agreePercentTotal,
      disagree_count: disagreeCount,
      disagree_percent_present: disagreePercentPresent,
      neutral_count: neutralCount,
      neutral_percent_present: neutralPercentPresent,
      is_passed: isPassed,
      required_ratio: requiredRatio,
      delegate_status_list: delegateVotingStatus
    };
  }

  // Khôi phục dữ liệu ban đầu nếu cần
  static resetToDefault() {
    memoryDb = JSON.parse(JSON.stringify(INITIAL_DATA));
    saveDbImmediate(memoryDb);
    return true;
  }

  // Xuất toàn bộ dữ liệu hiện tại để sao lưu
  static getFullData() {
    return readDb();
  }

  // Khôi phục toàn bộ dữ liệu từ bản sao lưu
  static restoreFullData(backupData) {
    if (!backupData || !Array.isArray(backupData.sessions) || !Array.isArray(backupData.delegates) || !Array.isArray(backupData.agendas)) {
      throw new Error("Dữ liệu sao lưu không đúng cấu trúc!");
    }
    memoryDb = JSON.parse(JSON.stringify(backupData));
    saveDbImmediate(memoryDb);
    return true;
  }

  // --- SYSTEM CONFIG ---
  static getConfig(key, defaultValue = null) {
    const db = readDb();
    if (!db.configs) db.configs = {};
    return db.configs[key] !== undefined ? db.configs[key] : defaultValue;
  }

  static setConfig(key, value) {
    const db = readDb();
    if (!db.configs) db.configs = {};
    db.configs[key] = value;
    writeDb(db);
    return db.configs;
  }

  static getAllConfigs() {
    const db = readDb();
    return db.configs || {};
  }

  // Tình trạng kết nối lưu trữ
  static getStorageStatus() {
    let storageType = 'Cục bộ (database.json)';
    let detail = 'Chưa kết nối Cloud DB';
    if (isMysqlConnected) {
      storageType = 'Cloud TiDB Serverless (MySQL 5GB Miễn Phí)';
      detail = `Database: '${mysqlActiveDb}' | Bảng chức năng: sessions, agendas, delegates, votes, system_config, meeting_state`;
    } else if (isPgConnected) {
      storageType = 'Cloud PostgreSQL (Neon / Supabase - Vĩnh viễn)';
      detail = 'PostgreSQL Cloud Storage';
    } else if (isMongoConnected) {
      storageType = 'MongoDB Atlas (Cloud Vĩnh Viễn)';
      detail = 'MongoDB Atlas Cloud';
    }

    const hasEnv = Boolean(
      process.env.TIDB_URL || 
      process.env.TIDB_URI || 
      process.env.MYSQL_URL || 
      process.env.MYSQL_URI || 
      process.env.DATABASE_URL || 
      process.env.TIDB_HOST
    );

    return {
      isCloudConnected: isMysqlConnected || isPgConnected || isMongoConnected,
      isMysqlConnected,
      isPgConnected,
      isMongoConnected,
      storageType,
      detail,
      lastError: lastDatabaseError,
      hasEnvConfig: hasEnv,
      configuredDatabase: mysqlActiveDb
    };
  }

  static async connectCustom(rawUri) {
    if (!rawUri || typeof rawUri !== 'string') throw new Error('Vui lòng nhập chuỗi kết nối hợp lệ');
    process.env.TIDB_URL = rawUri.trim();
    try {
      fs.writeFileSync(path.join(DATA_DIR, 'cloud_config.json'), JSON.stringify({ TIDB_URL: rawUri.trim() }, null, 2), 'utf8');
    } catch (e) {}

    const success = await initMysql(3, 1200);
    if (!success) {
      throw new Error(lastDatabaseError || 'Không thể kết nối tới cơ sở dữ liệu với thông tin đã cung cấp');
    }
    return true;
  }

  static initMongo() {
    return initMongo();
  }

  static initPg() {
    return initPg();
  }

  static initMysql(retries = 3, delayMs = 1500) {
    return initMysql(retries, delayMs);
  }
}

// Khởi tạo DB nếu chưa có
readDb();

module.exports = Database;
