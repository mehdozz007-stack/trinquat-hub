/**
 * Service Factory
 * Central initialization of all services
 */

import { SubscriberRepository } from "./repositories/subscriberRepository";
import { EventRepository } from "./repositories/eventRepository";
import { GalleryRepository } from "./repositories/galleryRepository";
import { DraftRepository } from "./repositories/draftRepository";

import { SubscriberService } from "./services/subscriberService";
import { EventService } from "./services/eventService";
import { GalleryService } from "./services/galleryService";
import { DraftService } from "./services/draftService";

export interface Services {
  subscriber: SubscriberService;
  event: EventService;
  gallery: GalleryService;
  draft: DraftService;
}

/**
 * Initialize all services with database and R2 bucket
 */
export function createServices(db: D1Database, r2Bucket?: R2Bucket): Services {
  return {
    subscriber: new SubscriberService(new SubscriberRepository(db)),
    event: new EventService(new EventRepository(db), r2Bucket),
    gallery: new GalleryService(new GalleryRepository(db), r2Bucket),
    draft: new DraftService(new DraftRepository(db)),
  };
}
