exports.createTables = (db) => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            userName TEXT,
            banned INTEGER DEFAULT 0,
            banReason TEXT DEFAULT ""
        );
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY,
            userName TEXT,
            FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            name TEXT,
            description TEXT DEFAULT "",
            image_urls JSON DEFAULT [],
            cost INTEGER,
            inStock INTEGER DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY,
            productId INTEGER,
            userId INTEGER,
            commentary TEXT DEFAULT "",
            done INTEGER DEFAULT 0,
            FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY,
            userId INTEGER,
            commentary TEXT DEFAULT "",
            image_urls JSON DEFAULT [],
            closed INTEGER DEFAULT 0,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        );
    `);
}