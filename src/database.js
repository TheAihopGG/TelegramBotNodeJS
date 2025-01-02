exports.createTables = (db) => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            userName TEXT,
            banned INTEGER DEFAULT 0,
            banReason TEXT DEFAULT ""
        );
        CREATE TABLE IF NOT EXISTS admins (
            id TEXT PRIMARY KEY,
            userName TEXT,
            FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT,
            description TEXT DEFAULT "",
            image_urls JSON DEFAULT [],
            cost INTEGER,
            inStock INTEGER DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            productId TEXT,
            userId TEXT,
            commentary TEXT DEFAULT "",
            done INTEGER DEFAULT 0,
            FOREIGN KEY (productId) REFERENCES products(id)
            FOREIGN KEY (userId) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS tickets (
            id TEXT PRIMARY KEY,
            userId TEXT,
            commentary TEXT DEFAULT "",
            image_urls JSON DEFAULT [],
            closed INTEGER DEFAULT 0,
            FOREIGN KEY (userId) REFERENCES users(id)
        );
    `);
}