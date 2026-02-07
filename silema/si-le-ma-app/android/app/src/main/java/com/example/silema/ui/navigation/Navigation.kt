package com.example.silema.ui.navigation

import androidx.compose.runtime.Composable
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.silema.ui.screens.CheckInScreen
import com.example.silema.ui.screens.SetupScreen
import com.example.silema.ui.viewmodel.CheckInViewModel
import com.example.silema.ui.viewmodel.SetupViewModel

sealed class Screen(val route: String) {
    object Setup : Screen("setup")
    object CheckIn : Screen("checkin")
}

@Composable
fun SetupNavGraph(
    navController: NavHostController = rememberNavController()
) {
    val setupViewModel: SetupViewModel = viewModel()
    val checkInViewModel: CheckInViewModel = viewModel()

    NavHost(
        navController = navController,
        startDestination = Screen.Setup.route
    ) {
        composable(Screen.Setup.route) {
            SetupScreen(
                viewModel = setupViewModel,
                onSetupComplete = {
                    navController.navigate(Screen.CheckIn.route) {
                        popUpTo(Screen.Setup.route) { inclusive = true }
                    }
                }
            )
        }
        composable(Screen.CheckIn.route) {
            CheckInScreen(viewModel = checkInViewModel)
        }
    }
}
