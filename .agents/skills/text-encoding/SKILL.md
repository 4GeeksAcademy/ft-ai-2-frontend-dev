---
name: text-encoding
description: A demonstration skill that applies various text encoding and cipher techniques to plain text, or decodes text that was encoded with those techniques.
---

This skill provides two text encoding/decoding techniques: **Caesar cipher (ROT-n)** and **Vigenère cipher**.

## Caesar Cipher (ROT-n)

The Caesar cipher shifts each letter in the text by a fixed number of positions (`n`) in the alphabet. It wraps around from Z back to A. Non-alphabetic characters (spaces, punctuation, numbers) are left unchanged.

### Encoding
To encode text using an arbitrary ROT-n shift, use the `rot_encode` function from the `scripts/rot-n.py` script, providing the text and the desired shift value as arguments:

```
python scripts/rot-n.py "<text>" <shift>
```

### Decoding with a known shift
To decode text using a known ROT-n shift, use the `rot_encode` function, providing the encoded text and the negative of the shift value as arguments:

```
python scripts/rot-n.py "<encoded_text>" -<shift>
```

Alternatively, since ROT13 is its own inverse (symmetric), encoding and decoding are the same operation when `n=13`.

### Decoding without a known shift (brute force)
To decode text without a known ROT-n shift, call the `rot_encode` function in a loop, trying all possible shift values (1-25) and selecting the one that produces readable English text.

## Vigenère Cipher

The Vigenère cipher uses a keyword to apply different Caesar shifts to each letter of the text. Each letter's shift is determined by the corresponding letter in the key (`A`=0, `B`=1, ..., `Z`=25). The key repeats cyclically to cover the full text. Non-alphabetic characters are left unchanged and do not advance the key position.

### Encoding
To encode text using a Vigenère cipher, use the `vigenere_encode` function from the `scripts/vigenere.py` script, providing the text and the key:

```
python scripts/vigenere.py encode "<text>" <key>
```

### Decoding
To decode text that was encoded with a Vigenère cipher, use the `vigenere_decode` function, providing the encoded text and the same key that was used for encoding:

```
python scripts/vigenere.py decode "<encoded_text>" <key>
```