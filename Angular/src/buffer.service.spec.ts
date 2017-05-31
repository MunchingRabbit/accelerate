import { TestBed, inject } from '@angular/core/testing';

import { BufferService } from './buffer.service';

describe('BufferService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BufferService]
    });
  });

  it('should be created', inject([BufferService], (service: BufferService) => {
    expect(service).toBeTruthy();
  }));
});
