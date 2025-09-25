import { newSpecPage } from '@stencil/core/testing';
import { LeeduFormTest } from '../../leedu-form-test/leedu-form-test';

describe('leedu-form', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [LeeduFormTest],
      html: `<leedu-form></leedu-form>`,
    });
    expect(page.root).toEqualHtml(`
      <leedu-form>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </leedu-form>
    `);
  });
});
