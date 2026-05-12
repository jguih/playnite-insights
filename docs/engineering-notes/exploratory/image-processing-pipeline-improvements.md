# [Server] - Image Processing Pipeline Improvements

## Status

Confirmed

## Summary

The image processing pipeline requires a structural refactor to decouple transport-layer dependencies from application logic and move heavy processing out of the synchronous request lifecycle. This change introduces a five-step asynchronous pipeline managed by the job queue and a dedicated media asset management system.

The primary outcome is a more modular architecture where image transformations, metadata extraction, and storage management are isolated from the initial file upload.

## Motivation

The current implementation suffers from several architectural and performance bottlenecks:
- transport concerns leak into the application layer through a hard dependency on busboy across multiple processing stages
- synchronous processing of images during api requests increases latency and risks request timeouts
- lack of isolation between pipeline steps makes the system fragile and difficult to maintain
- the core game entity is overloaded with media-specific metadata, violating domain boundaries

## Existing behavior

The server currently handles image processing as a monolithic, synchronous operation. When a file is uploaded, the transport layer (busboy) is directly involved in the processing logic. Media metadata is stored directly within the `Game` table, and there is no dedicated storage or lifecycle management for temporary files or background processing of asset variants.

## Desired outcome

The system must transition to a background processing model where the api only handles the initial file reception. Key outcomes include:
- removal of busboy dependencies from all application logic not related to transportation
- reduction of the `Game` entity to core domain metadata, referencing assets via `coverAssetId` and `backgroundAssetId`
- implementation of a `GameMediaAssets` table to track image metadata, including dominant colors for frontend placeholders
- guaranteed cleanup of temporary files via automated lifecycle management

## Constraints

- the initial file upload must remain a streaming process using busboy to manage memory efficiency
- all processing steps following the initial upload must be executed by a background job processor
- temporary files must have a strictly enforced expiration and cleanup policy to prevent storage leaks
- image transformations must result in webp format with optimized quality and derived variants (icons/thumbnails)

## Alternatives

### synchronous processing with busboy abstraction

The system could abstract busboy behind a generic interface while keeping processing synchronous.
- benefits: lower implementation complexity
- drawbacks: does not address request latency or the lack of failure recovery for long-running image transformations
Rejected because background processing is essential for the scaling and reliability of media ingestion.

## Proposed design

The new pipeline is divided into a single synchronous phase followed by a four-stage asynchronous sequence.

### Phase 1: synchronous ingestion (step 1)

During the request lifecycle, the server uses busboy to stream the incoming file directly to a temporary storage location. This step is strictly limited to transportation. Once the stream is closed and the file is persisted to the temporary path, the server returns a success response and queues a processing job. The caller does not wait for subsequent steps.

### Phase 2: asynchronous pipeline (steps 2-5)

The job processor claims the task and executes the remaining logic outside the api context.

- step 2: file validation. The worker verifies the file extension, format, and bitstream integrity of the temporary file to ensure it is safe for processing
- step 3: image processing with sharp. The system performs several transformations, including resizing to standard dimensions, reducing quality, and converting the source to webp. Crucially, this step also calculates the dominant color of the image and generates missing icon variants
- step 4: asset transfer. Processed images and their variants are moved from temporary storage to the final, game-specific asset storage location. The `GameMediaAssets` table is updated with the final paths, metadata, and the dominant color
- step 5: cleanup. The worker removes the original temporary file. A separate scheduled cleanup job runs periodically to recover storage from orphaned files resulting from failed or abandoned uploads

### Metadata and synchronization

The `Game` model is updated to reference images through asset ids. Media metadata synchronization is handled independently of the game domain, allowing the frontend to use the generated dominant color as a placeholder while high-resolution assets load.

## Validation

- unit tests for sharp transformation logic (webp conversion, quality, and resizing)
- integration tests for the job queue flow from upload to cleanup
- manual verification of file integrity checks for corrupted uploads
- validation of the dominant color extraction accuracy
- verification of temporary file cleanup after job completion or expiration

## Open Questions

- should we implement a retry limit specifically for the sharp processing step to handle malformed but validly-formatted files
- what is the optimal retention period for temporary files before the fallback cleanup job triggers

## Follow-ups

- implement support for external s3-compatible storage providers in the transfer step
- add image optimization metrics to the observability dashboard
- support for animated gif to webp/webm conversion