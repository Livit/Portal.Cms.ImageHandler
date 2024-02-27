#!/bin/bash
#
# This assumes all of the OS-level configuration has been completed and git repo has already been cloned
#
# This script should be run from the repo's deployment directory
# cd deployment
# ./build-s3-dist.sh source-bucket-base-name trademarked-solution-name version-code
#
# Paramenters:
#  - source-bucket-base-name: Name for the S3 bucket location where the template will source the Lambda
#    code from. The template will append '-[region_name]' to this bucket name.
#    For example: ./build-s3-dist.sh solutions my-solution v1.0.0
#    The template will then expect the source code to be located in the solutions-[region_name] bucket
#
#  - trademarked-solution-name: name of the solution for consistency
#
#  - version-code: version of the package

# Check to see if input has been provided:
if [ -z "$SOLUTION_NAME" ]; then
    echo "Please provide the trademark approved solution name through environment variables"
    exit 1
fi

function headline(){
  echo "------------------------------------------------------------------------------"
  echo "$1"
  echo "------------------------------------------------------------------------------"
}

headline "[Init] Setting up paths and variables"
deployment_dir="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
staging_dist_dir="$deployment_dir/staging"
template_dist_dir="$deployment_dir/global-s3-assets"
build_dist_dir="$deployment_dir/regional-s3-assets"
source_dir="$deployment_dir/../source"
cdk_source_dir="$source_dir/constructs"


headline "[Init] Clean old folders"
rm -rf "$staging_dist_dir"
mkdir -p "$staging_dist_dir"
rm -rf "$template_dist_dir"
mkdir -p "$template_dist_dir"
rm -rf "$build_dist_dir"
mkdir -p "$build_dist_dir"

headline "[Package] Image-handler code"
cd $source_dir/image-handler
npm install
npm run build
cp dist/image-handler.zip $build_dist_dir/image-handler.zip

headline "[Package] Demo-ui assets"
mkdir $build_dist_dir/demo-ui/
cp -r $source_dir/demo-ui/** $build_dist_dir/demo-ui/

headline "[Package] Сustom-resource code"
cd $source_dir/custom-resource
npm install
npm run build
cp dist/custom-resource.zip $build_dist_dir/custom-resource.zip

headline "[Package] Сustom-resource code"
cd $deployment_dir/manifest-generator
npm install
node app.js --target ../../source/demo-ui --output $build_dist_dir/demo-ui-manifest.json
