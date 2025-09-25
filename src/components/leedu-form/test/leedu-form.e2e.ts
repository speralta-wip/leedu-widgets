import { newE2EPage } from '@stencil/core/testing';

describe('leedu-form', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<leedu-form></leedu-form>');

    const element = await page.find('leedu-form');
    expect(element).toHaveClass('hydrated');
  });
});
