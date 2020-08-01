# precompress
[![](https://img.shields.io/npm/v/precompress.svg?style=flat)](https://www.npmjs.org/package/precompress) [![](https://img.shields.io/npm/dm/precompress.svg)](https://www.npmjs.org/package/precompress)

> Generate pre-compressed .gz and .br files for static web servers

Compresses files for use with web servers like nginx with the `gzip_static` and `brotli_static` directives. Files are compressed in parallel, using the available CPU cores efficiently. Existing output files will always be overridden.

## Installation
```
npm i precompress
```

## Usage
```
usage: precompress [options] <files,dirs,...>

  Options:
    -t, --types <type,...>   Types of files to generate. Default: gz,br
    -c, --concurrency <num>  Number of concurrent operations. Default: auto
    -i, --include <ext,...>  Only include given file extensions
    -e, --exclude <ext,...>  Exclude given file extensions
    -m, --mtime              Skip creating existing files when source file is newer
    -f, --follow             Follow symbolic links
    -s, --silent             Do not print compression times
    -h, --help               Show this text
    -v, --version            Show the version

  Examples:
    $ precompress build
```

© [silverwind](https://github.com/silverwind), distributed under BSD licence
