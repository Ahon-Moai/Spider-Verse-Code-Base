<?php
/**
 * Configuration loader wrapper
 *
 * Delegates to the unified root config.php to maintain compatibility
 * with all existing endpoints and scripts.
 */

return require dirname(__DIR__, 2) . '/config.php';
