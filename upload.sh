for f in *
do
  if [[ -f $f ]]; then
    filename=$(basename $f)
    extension=$(node -e "process.stdout.write(require('path').extname('$filename'))")
    if [[ -z "$extension" ]]; then
      # echo "aws s3 cp ./$f s3://jamesfriend.com.au/$f  --content-type 'text/html'"
      aws s3 cp ./$f s3://jamesfriend.com.au/$f  --content-type 'text/html'
    fi
  fi
done