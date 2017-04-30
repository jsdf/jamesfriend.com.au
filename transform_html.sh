#!/bin/bash

files_to_process=()
add_files() {
  for file in "$@"; do
    local mimetype=$(file --brief --mime-type "$file")
    case $mimetype in
      'text/html' )
        echo "adding html file $file"
        files_to_process+=($file)
      ;;
      *)
        echo "skipping $file"
      ;;
    esac
  done
}

clear_files() {
  files_to_process=()
}

do_transform() {
  jscodeshift -d --run-in-band --transform ./templatizeHTML.js "${files_to_process[@]}"
}

extract_data() {
  node ./extractData.js "${files_to_process[@]}"
}

add_files html/node/*
extract_data
# clear_files
# add_files html/*
# add_files html/content
# add_files html/archive
# add_files html/tags
# do_transform
