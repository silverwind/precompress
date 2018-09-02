# precompress
[![](https://img.shields.io/npm/v/precompress.svg?style=flat)](https://www.npmjs.org/package/precompress) [![](https://img.shields.io/npm/dm/precompress.svg)](https://www.npmjs.org/package/precompress) [![](https://api.travis-ci.org/silverwind/precompress.svg?style=flat)](https://travis-ci.org/silverwind/precompress)

> Generate pre-compressed .gz and .br files for static web servers

Outputs files to be used with web servers like nginx with the `gzip_static` and `brotli_static` directives. Files are compressed in parallel, using the available CPU cores efficiently. Existing output files will always be overridden.

## Installation
```
npm i precompress
```

## Usage
```
usage: precompress [FILES,DIRS]...

  Options:
    -i, --include <ext,...>  Only include given file extensions
    -e, --exclude <ext,...>  Exclude given file extensions
    -v, --verbose            Print additional information
    -h, --help               Show this text

  Examples:
    $ precompress -v build
```

© [silverwind](https://github.com/silverwind), distributed under BSD licence
