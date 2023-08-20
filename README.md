# precompress
[![](https://img.shields.io/npm/v/precompress.svg?style=flat)](https://www.npmjs.org/package/precompress) [![](https://img.shields.io/npm/dm/precompress.svg)](https://www.npmjs.org/package/precompress) [![](https://packagephobia.com/badge?p=precompress)](https://packagephobia.com/result?p=precompress)

CLI to compress files to gzip and brotli. Files are efficiently compressed in parallel. Existing output files will always be overridden.

## Usage
```bash
# compress all files in the "build" directory using node
npx precompress ./build

# same with bun
bunx precompress ./build
```

## Options
```
usage: precompress [options] <files,dirs,...>

  Options:
    -t, --types <type,...>    Types of files to generate. Default: gz,br
    -i, --include <glob,...>  Only include given globs. Default: unset
    -e, --exclude <glob,...>  Exclude given globs. Default: **.gz,**.br
    -m, --mtime               Skip creating existing files when source file is newer
    -f, --follow              Follow symbolic links
    -d, --delete              Delete source file after compression
    -o, --outdir              Output directory, will preserve relative path structure
    -b, --basedir             Base directory to derive output path, use with --outdir
    -E, --extensionless       Do not output a extension, use with single --type and --outdir
    -s, --silent              Do not print anything
    -S, --sensitive           Treat include and exclude patterns case-sensitively
    -c, --concurrency <num>   Number of concurrent operations. Default: auto
    -V, --verbose             Print individual file compression times
    -h, --help                Show this text
    -v, --version             Show the version

  Examples:
    $ precompress ./build
```

© [silverwind](https://github.com/silverwind), distributed under BSD licence
