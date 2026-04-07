## Root Cause and Fix for Pupular White Screen Bug

**Root Cause:**
The original `SwipeScreen.js` component, during its initial render, had a loading condition `if (animals.length === 0 && !error)`. This condition would display an `ActivityIndicator` (loading spinner). However, if `loadAnimals` completed and returned an empty array (meaning no pets were found for the given filters), the `animals.length === 0` condition would remain true, but `loading` would become `false`. This would incorrectly keep the component in a loading state, or lead to ambiguous rendering behavior if `loading` was not explicitly checked.

The true "white screen" behavior suggests a more fundamental rendering issue, potentially an unhandled exception preventing *any* UI from being rendered. The initial fix addresses the loading state logic, which is a necessary correction regardless, ensuring the loading spinner only appears when data is actively being fetched. If the white screen *still* occurs after this fix, it points to a deeper, uncaught exception within the `SwipeScreen` or its subcomponents during initial render, which would require debugging with access to console logs or error boundaries.

**Minimal Correct Change:**
The `SwipeScreen.js` file was edited to make the loading spinner display conditional on the `loading` state being true, in addition to the `animals` array being empty and no error present.

**SwipeScreen.js:**
- **FROM:**
  ```javascript
  if (animals.length === 0 && !error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header onFilter={() => setShowFilter(true)} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.coral} />
          <Text style={styles.loadingText}>Finding pets near you...</Text>
        </View>
      </SafeAreaView>
    );
  }
  ```
- **TO:**
  ```javascript
  if (loading && animals.length === 0 && !error) { // Only show spinner if actively loading and no animals yet
    return (
      <SafeAreaView style={styles.container}>
        <Header onFilter={() => setShowFilter(true)} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.coral} />
          <Text style={styles.loadingText}>Finding pets near you...</Text>
        </View>
      </SafeAreaView>
    );
  }
  ```

This ensures that the app correctly transitions from a loading state to either displaying pet cards or an "Out of Cards" message if no animals are found, without getting stuck in an indeterminate state that could manifest as a white screen if other parts of the rendering flow encounter issues.
