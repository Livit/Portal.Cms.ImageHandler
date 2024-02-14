// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Based on Thumbor mapper
// SPDX-License-Identifier: Apache-2.0

import { ImageEdits, ImageFitTypes, ImageFormatTypes } from "./lib";

export class CustomMapper {
  private static readonly EMPTY_IMAGE_EDITS: ImageEdits = {};

  /**
   * Initializer function for creating a new Custom mapping, used by the image
   * handler to perform image modifications based on legacy URL path requests.
   * @param path The request path.
   * @returns Image edits based on the request path.
   */
  public mapPathToEdits(path: string): ImageEdits {
    const fileFormat = this.extractFileFormat(path);

    let edits: ImageEdits = this.mergeEdits(this.mapCrop(path), this.mapResize(path), this.mapFitIn(path));

    return edits;
  }

  /**
   * Enables users to migrate their current image request model to the SIH solution,
   * without changing their legacy application code to accommodate new image requests.
   * @param path The URL path extracted from the web request.
   * @returns The parsed path using the match pattern and the substitution.
   */
  public parseCustomPath(path: string): string {
    // Perform the substitution and return
    const { REWRITE_MATCH_PATTERN, REWRITE_SUBSTITUTION } = process.env;

    if (path === undefined) {
      throw new Error("CustomMapper::ParseCustomPath::PathUndefined");
    } else if (REWRITE_MATCH_PATTERN === undefined) {
      throw new Error("CustomMapper::ParseCustomPath::RewriteMatchPatternUndefined");
    } else if (REWRITE_SUBSTITUTION === undefined) {
      throw new Error("CustomMapper::ParseCustomPath::RewriteSubstitutionUndefined");
    } else {
      let parsedPath = "";

      if (typeof REWRITE_MATCH_PATTERN === "string") {
        const patternStrings = REWRITE_MATCH_PATTERN.split("/");
        const flags = patternStrings.pop();
        const parsedPatternString = REWRITE_MATCH_PATTERN.slice(1, REWRITE_MATCH_PATTERN.length - 1 - flags.length);
        const regExp = new RegExp(parsedPatternString, flags);
        parsedPath = path.replace(regExp, REWRITE_SUBSTITUTION);
      } else {
        parsedPath = path.replace(REWRITE_MATCH_PATTERN, REWRITE_SUBSTITUTION);
      }

      return parsedPath;
    }
  }

  /**
   * Maps the image path to crop image edit.
   * @param path an image path.
   * @returns image edits associated with crop.
   */
  private mapCrop(path: string): ImageEdits {
    // not implemented

    return CustomMapper.EMPTY_IMAGE_EDITS;
  }

  /**
   * Maps the image path to resize image edit.
   * @param path An image path.
   * @returns Image edits associated with resize.
   */
  private mapResize(path: string): ImageEdits {
    // Process the dimensions
    const widthMatchResult = path.match(/w=(\d+)/);
    const heightMatchResult = path.match(/h=(\d+)/);

    if (widthMatchResult && heightMatchResult) {
      // Parse width and height from the match results
      const width = Number(widthMatchResult[1]);
      const height = Number(heightMatchResult[1]);

      // Set only if the dimensions provided are valid
      if (!isNaN(width) && !isNaN(height)) {
        const resizeEdit: ImageEdits = { resize: {} };

        // If width or height is 0, fit would be inside.
        if (width === 0 || height === 0) {
          resizeEdit.resize.fit = ImageFitTypes.INSIDE;
        }
        resizeEdit.resize.width = width === 0 ? null : width;
        resizeEdit.resize.height = height === 0 ? null : height;

        return resizeEdit;
      }
    }

    return CustomMapper.EMPTY_IMAGE_EDITS;
  }

  /**
   * Maps the image path to fit image edit.
   * @param path An image path.
   * @returns Image edits associated with fit-in filter.
   */
  private mapFitIn(path: string): ImageEdits {
    // not implemented
    return CustomMapper.EMPTY_IMAGE_EDITS;
  }

  /**
   * A helper method to merge edits.
   * @param edits Edits to merge.
   * @returns Merged edits.
   */
  private mergeEdits(...edits: ImageEdits[]) {
    return edits.reduce((result, current) => {
      Object.keys(current).forEach((key) => {
        if (Array.isArray(result[key]) && Array.isArray(current[key])) {
          result[key] = Array.from(new Set(result[key].concat(current[key])));
        } else if (this.isObject(result[key]) && this.isObject(current[key])) {
          result[key] = this.mergeEdits(result[key], current[key]);
        } else {
          result[key] = current[key];
        }
      });

      return result;
    }, {});
  }

  /**
   * A helper method to check whether a passed argument is object or not.
   * @param obj Object to check.
   * @returns Whether or not a passed argument is object.
   */
  private isObject(obj: unknown): boolean {
    return obj && typeof obj === "object" && !Array.isArray(obj);
  }

  private extractFileFormat(path: string): ImageFormatTypes {
    const matchResult = path.match(/\.([a-z0-9]+)(\?|$)/i);
    if (matchResult) {
      const format = matchResult[1].toUpperCase();
      if (format in ImageFormatTypes) {
        return ImageFormatTypes[format as keyof typeof ImageFormatTypes];
      }
    }
  }
}