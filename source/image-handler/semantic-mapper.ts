// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Based on Thumbor mapper
// SPDX-License-Identifier: Apache-2.0

import { ImageEdits, ImageFitTypes, ImageHandlerEvent } from "./lib";

export class SemanticMapper {
  private static readonly EMPTY_IMAGE_EDITS: ImageEdits = {};

  /**
   * Initializer function for creating a new Custom mapping, used by the image
   * handler to perform image modifications based on legacy URL path requests.
   * @param path The request path.
   * @returns Image edits based on the request path.
   */
  public mapPathToEdits(event: ImageHandlerEvent): ImageEdits {
    let edits: ImageEdits = this.mapResize(event);

    return edits;
  }

  /**
   * Maps the image path to resize image edit.
   * @param path An image path.
   * @returns Image edits associated with resize.
   */
  private mapResize(event: ImageHandlerEvent): ImageEdits {
    if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) {
      let q = event.queryStringParameters;

      const [width, height] = [q.w, q.h].map((dim) => (dim ? parseInt(dim) : 0));
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
    return SemanticMapper.EMPTY_IMAGE_EDITS;
  }
}
