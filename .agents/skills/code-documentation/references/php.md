# PHP — Comments & Documentation Reference

## Overview

PHP supports several commenting styles and has a mature PHPDoc convention for structured documentation. PHPDoc is supported by most IDEs (PhpStorm, VS Code with Intelephense) and documentation generators (phpDocumentor).

---

## 1. Single-Line Comments

```php
// Calculate the discounted price after applying the coupon
$finalPrice = $price - $discount;

$taxRate = 0.08; // 8% sales tax

# Alternative single-line comment style (less common, avoid for consistency)
$subtotal = $total; # This also works but is uncommon
```

> **Recommendation:** Use `//` for single-line comments. The `#` style is valid but used less frequently in modern PHP.

---

## 2. Multi-Line (Block) Comments

```php
/*
 * This block of code handles user authentication.
 * It checks the session token and refreshes it
 * if the token is about to expire.
 */
if (!$session->isValid()) {
    $session->refresh();
}
```

> **Note:** `/* */` comments are for explanatory notes only. Use `/** */` (PHPDoc) for documented code.

---

## 3. PHPDoc — The Standard for Documentation

PHPDoc blocks start with `/**` and use `@` tags. They can be placed above functions, classes, properties, constants, and more.

### Documenting Functions / Methods

```php
/**
 * Calculate the total price including tax and optional shipping.
 *
 * @param float $basePrice The base price before tax (must be >= 0).
 * @param float $taxRate   The tax rate as a decimal (e.g., 0.08 for 8%).
 * @param float $shipping  Optional shipping cost (defaults to 0.0).
 *
 * @return float The final price rounded to two decimal places.
 *
 * @throws \InvalidArgumentException If basePrice is negative.
 *
 * @example
 * ```php
 * $total = calculateTotal(100.0, 0.08, 5.0);
 * // $total === 108.0
 * ```
 */
function calculateTotal(
    float $basePrice,
    float $taxRate,
    float $shipping = 0.0
): float {
    if ($basePrice < 0) {
        throw new \InvalidArgumentException('basePrice must be non-negative');
    }
    $total = $basePrice * (1 + $taxRate) + $shipping;
    return round($total, 2);
}
```

### Documenting Classes

```php
/**
 * Represents a user account in the system.
 *
 * Users are created upon registration and store profile data
 * as well as authentication metadata.
 *
 * @package App\Models
 */
class User
{
    /**
     * The user's unique identifier (auto-generated UUID).
     *
     * @var string
     */
    private string $id;

    /**
     * The user's email address (used for login).
     *
     * @var string
     */
    private string $email;

    /**
     * The user's display name.
     *
     * @var string
     */
    private string $name;

    /**
     * Create a new User instance.
     *
     * @param string $email The email address for the account.
     * @param string $name  The display name for the account.
     */
    public function __construct(string $email, string $name)
    {
        $this->id = bin2hex(random_bytes(16));
        $this->email = $email;
        $this->name = $name;
    }

    /**
     * Return a greeting message for this user.
     *
     * @return string A greeting like "Hello, Alice!".
     */
    public function greet(): string
    {
        return "Hello, {$this->name}!";
    }
}
```

### Documenting Interfaces

```php
/**
 * Contract for cache storage implementations.
 *
 * Implement this interface to provide custom caching backends
 * (e.g., Redis, Memcached, filesystem).
 *
 * @package App\Contracts
 */
interface CacheInterface
{
    /**
     * Retrieve a value from the cache.
     *
     * @param string $key The cache key.
     *
     * @return mixed The cached value, or null if not found.
     */
    public function get(string $key): mixed;

    /**
     * Store a value in the cache.
     *
     * @param string $key   The cache key.
     * @param mixed  $value The value to store.
     * @param int    $ttl   Time-to-live in seconds (default: 3600).
     *
     * @return bool True on success, false on failure.
     */
    public function set(string $key, mixed $value, int $ttl = 3600): bool;
}
```

### Documenting Class Properties

```php
class Order
{
    /** @var int The unique order ID. */
    public int $id;

    /** @var string|null Optional coupon code applied to the order. */
    public ?string $couponCode = null;

    /**
     * The line items in this order.
     *
     * Each item is an associative array with 'product_id', 'quantity', and 'price'.
     *
     * @var array<int, array<string, mixed>>
     */
    public array $items = [];
}
```

---

## 4. Common PHPDoc Tags

| Tag              | Purpose                                        | Example                                            |
|------------------|------------------------------------------------|----------------------------------------------------|
| `@param`         | Documents a function/method parameter          | `@param string $name The user's name`              |
| `@return`        | Documents the return value                     | `@return int The sum of a and b`                   |
| `@throws`        | Documents exceptions that may be thrown        | `@throws \InvalidArgumentException On bad input`   |
| `@var`           | Documents the type of a property or variable   | `@var string`                                      |
| `@property`      | Documents a magic `__get`/`__set` property     | `@property string $title`                          |
| `@method`        | Documents a magic `__call` method              | `@method int sum(int $a, int $b)`                  |
| `@deprecated`    | Marks the API as deprecated                    | `@deprecated Use calculateTotal() instead`         |
| `@see`           | References related code or documentation       | `@see \App\Services\PricingService`                |
| `@link`          | Provides an external URL                       | `@link https://example.com/docs/pricing`           |
| `@example`       | Provides a usage example                       | `@example calculateTotal(100, 0.08)`               |
| `@template`      | Documents a generic type parameter (PHP 8+)    | `@template T The item type`                        |
| `@template-covariant`| Covariant generic (PHP 8+)                 | `@template-covariant T`                            |
| `@implements`    | Shows which interface is implemented           | `@implements IteratorAggregate<int, Item>`         |
| `@package`       | Organizes code into logical packages           | `@package App\Services`                            |
| `@api`           | Marks the element as part of the public API    | `@api`                                              |
| `@internal`      | Marks the element as internal (not for public) | `@internal`                                        |
| `@inheritDoc`    | Inherits documentation from a parent           | `@inheritDoc`                                      |

---

## 5. PHP 8+ Native Type Declarations as Documentation

Modern PHP supports typed properties, parameters, and return types. These often reduce the need for verbose `@param` and `@return` tags.

```php
// ❌ Verbose — types are duplicated in docblock
/**
 * @param string $name
 * @param int $age
 * @return string
 */
function describe(string $name, int $age): string { ... }

// ✅ Concise — types are already in the signature
/**
 * Return a description string for a person.
 */
function describe(string $name, int $age): string { ... }
```

---

## 6. File-Level Docblocks

```php
<?php

/**
 * Date utility functions.
 *
 * This file contains helpers for formatting, parsing, and manipulating
 * ISO 8601 date strings. All functions return UTC-based results.
 *
 * @package App\Utils
 */
```

---

## 7. Inline PHPDoc for Variables

Document variables mid-assignment for clarity:

```php
/** @var array<int, User> $users */
$users = $repository->findAll();
```

---

## 8. Inline Comments Best Practices

```php
// ❌ Bad — states the obvious
// Increment $i by 1
$i++;

// ✅ Good — explains the reasoning
// Bump the counter to account for the header row
$i++;
```

---

## 9. TODO / FIXME / HACK Comments

```php
// TODO: Implement pagination for large result sets
// FIXME: This endpoint returns a 500 error when the list is empty
// HACK: Workaround for PHP 8.2 deprecation — remove when upgrading to 8.3
```

---

## Reference

- [PHPDoc Official Documentation](https://docs.phpdoc.org/)
- [PHP-FIG — PSR-19: PHPDoc Tags](https://www.php-fig.org/psr/psr-19/)
- [PHP Manual — Comments](https://www.php.net/manual/en/language.basic-syntax.comments.php)
- [PHPStan — PHPDoc Basics](https://phpstan.org/writing-php-code/phpdocs-basics)