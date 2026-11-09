<?php
/**
 * Application Configuration Loader
 *
 * Loads environment-specific overrides from config.local.php (git-ignored)
 * and falls back to placeholder defaults and environment variables.
 */

// Root directory of application
$rootDir = __DIR__;

// Default configuration with placeholders
$defaults = [
    'env' => getenv('APP_ENV') ?: ($_ENV['APP_ENV'] ?? 'production'),
    'secret' => getenv('APP_SECRET') ?: ($_ENV['APP_SECRET'] ?? 'YOUR_APP_SECRET'),
    'allowed_origin' => getenv('ALLOWED_ORIGIN') ?: ($_ENV['ALLOWED_ORIGIN'] ?? '*'),
    'db' => [
        'driver' => getenv('DB_DRIVER') ?: ($_ENV['DB_DRIVER'] ?? 'mysql'),
        'host' => getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? 'YOUR_DB_HOST'),
        'port' => getenv('DB_PORT') ?: ($_ENV['DB_PORT'] ?? '3306'),
        'name' => getenv('DB_NAME') ?: ($_ENV['DB_NAME'] ?? 'YOUR_DB_NAME'),
        'user' => getenv('DB_USER') ?: ($_ENV['DB_USER'] ?? 'YOUR_DB_USER'),
        'pass' => getenv('DB_PASS') !== false ? getenv('DB_PASS') : ($_ENV['DB_PASS'] ?? 'YOUR_DB_PASS'),
        'file' => $rootDir . '/database/aromatica.sqlite',
    ],
    'upload' => [
        'dir' => $rootDir . '/uploads',
        'public_path' => '/uploads',
        'max_size_mb' => (int)(getenv('MAX_UPLOAD_SIZE_MB') ?: ($_ENV['MAX_UPLOAD_SIZE_MB'] ?? 50)),
    ]
];

// Load git-ignored local configuration if present
$localConfig = [];
$localConfigFile = $rootDir . '/config.local.php';
if (file_exists($localConfigFile)) {
    $loaded = require $localConfigFile;
    if (is_array($loaded)) {
        $localConfig = $loaded;
    }
}

// Deep merge local config onto defaults
$config = array_replace_recursive($defaults, $localConfig);

// Configure error reporting based on environment
if (($config['env'] ?? 'production') === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
}

return $config;
