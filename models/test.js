async function getPlans (service, tier) {
        const stripe = require('stripe')('sk_test_W64Ct0wmxgf5B6K7faHVOF6A');
        if (service && tier) {
            let products = await stripe.products.list({limit: 100}).autoPagingToArray({limit: 10000});
            const filteredProducts = products.filter(product => {
                return (product.metadata['sb_service'] === service && product.metadata['sb_tier'] === tier)
            });
            if (filteredProducts.length > 0) {
                console.log("more than one product found");
                const productData = filteredProducts.map(async product => {
                    const plans = await stripe.plans.list({product: product.id});
                    if (plans.data.length > 0) {
                        return plans.data.map(plan => plan.id);
                    }
                    else {
                        return []
                    }
                });
                const productPlans = await Promise.all(productData);
                const allPlans = [].concat.apply([], productPlans);
                console.log(`All plan Ids found for service ${service} and tier ${tier}:`, allPlans);
                return allPlans;
            }
            else {
                throw ('no services & tiers found')
            }
        }
        else {
            throw ('no service or tier passed')
        }
    };
async function testo() {
    let allPlans = await getPlans('Example Simple', 'Simple');
    console.log(typeof allPlans);
    const items = allPlans.map((planId)=>{return {plan: planId}});
console.log("Items for subscription creation", items);
}
testo();


