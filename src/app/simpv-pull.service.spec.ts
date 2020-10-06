import { TestBed } from '@angular/core/testing';

import { SimpvPullService } from './simpv-pull.service';

describe('SimpvPullService', () => {
  let service: SimpvPullService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimpvPullService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
