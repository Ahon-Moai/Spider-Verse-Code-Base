<?php
/**
 * Example Configuration File
 *
 * Copy this file to config.local.php and update with your environment-specific credentials and settings.
 * config.local.php is git-ignored to prevent sensitive credentials from being committed.
 */

return [
    // Application environment: 'production' or 'development'
    'env' => 'production',

    // Secret key for application security / sessions / tokens (e.g. random 64-character hex string)
    'secret' => 'YOUR_APP_SECRET',

    // Allowed CORS origin (e.g. 'https://yourdomain.com' or '*' for development)
    'allowed_origin' => 'YOUR_ALLOWED_ORIGIN',

    // Database configuration
    'db' => [
        // Database driver: 'mysql' for MariaDB/MySQL (production/cPanel) or 'sqlite' for local development
        'driver' => 'mysql',

        // Database hostname (e.g. 'localhost' or '127.0.0.1')
        'host' => 'YOUR_DB_HOST',

        // Database port (default: '3306')
        'port' => '3306',

        // MariaDB database name
        'name' => 'YOUR_DB_NAME',

        // MariaDB database user
        'user' => 'YOUR_DB_USER',

        // MariaDB database password
        'pass' => 'YOUR_DB_PASS',

        // SQLite database file path (only used if driver is 'sqlite')
        'file' => __DIR__ . '/database/aromatica.sqlite',
    ],

    // Media upload storage configuration
    'upload' => [
        // Filesystem directory path for storing uploads
        'dir' => __DIR__ . '/uploads',

        // Publicly accessible URL path prefix for uploaded files
        'public_path' => '/uploads',

        // Maximum allowed file upload size in megabytes
        'max_size_mb' => 50,
    ]
];
