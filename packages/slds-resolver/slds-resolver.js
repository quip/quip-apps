const path = require("path");

const SLDSRootPattern = new RegExp(
    path.join("@salesforce-ux", "design-system")
);
const AssetsPattern = new RegExp(`^${path.sep}assets`);

class SLDSResolver {
    apply(resolver) {
        const target = resolver.ensureHook("existingFile");
        resolver
            .getHook("file")
            .tapAsync("SLDSPlugin", (request, resolveContext, callback) => {
                if (
                    SLDSRootPattern.test(request.descriptionFileRoot) &&
                    AssetsPattern.test(request.path)
                ) {
                    const aliased = Object.assign({}, request, {
                        path: path.join(
                            request.descriptionFileRoot,
                            request.path
                        ),
                        relativePath: "." + request.path,
                    });
                    resolver.doResolve(
                        target,
                        aliased,
                        `SLDS Asset: ${request.path}: ${path.join(
                            request.descriptionFileRoot,
                            request.path
                        )}`,
                        resolveContext,
                        callback
                    );
                } else {
                    callback();
                }
            });
    }
}
module.exports = SLDSResolver;
