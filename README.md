# precompress
[![](https://img.shields.io/npm/v/precompress.svg?style=flat)](https://www.npmjs.org/package/precompress) [![](https://img.shields.io/npm/dm/precompress.svg)](https://www.npmjs.org/package/precompress) [![](https://packagephobia.com/badge?p=precompress)](https://packagephobia.com/result?p=precompress)

CLI to compress files to gzip, brotli and zstd. Files are efficiently compressed in parallel. Existing output files are overwritten unless `-m` is given and they are newer than their source.

## Usage

```sh
pnpm dlx precompress ./build
```

## Options
```
usage: precompress [options] <files,dirs,...>

  Options:
    -t, --types <type,...>    Types of files to generate. Default: gz,br,zst
    -i, --include <glob,...>  Only include given globs. Default: unset
    -e, --exclude <glob,...>  Exclude given globs. Default: **.gz,**.br,**.zst
    -m, --mtime               Skip outputs that are newer than their source file
    -f, --follow              Follow symbolic links
    -d, --delete              Delete source file after compression
    -o, --outdir              Output directory, will preserve relative path structure
    -b, --basedir             Base directory to derive output path, use with --outdir
    -E, --extensionless       Do not output an extension, use with single --type and --outdir
    -s, --silent              Do not print anything
    -S, --sensitive           Treat include and exclude patterns case-sensitively
    -c, --concurrency <num>   Number of concurrent operations. Default: auto
    -V, --verbose             Print individual file compression times
    -h, --help                Show this text
    -v, --version             Show the version

  Examples:
    $ precompress ./build
```

The `-t`, `-i`, and `-e` options can be repeated. Unknown options are rejected.

© [silverwind](https://github.com/silverwind), distributed under BSD licence
