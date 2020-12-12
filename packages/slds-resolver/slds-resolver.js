const path = require("path");

class SLDSResolver {
    apply(resolver) {
        const target = resolver.ensureHook("existingFile");
        resolver
            .getHook("file")
            .tapAsync("SLDSPlugin", (request, resolveContext, callback) => {
                if (
                    /@salesforce-ux\/design-system/.test(
                        request.descriptionFileRoot
                    ) &&
                    /^\/assets/.test(request.path)
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
